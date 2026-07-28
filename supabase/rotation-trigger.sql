-- 1. Trigger to automatically rotate employee rotation_order when a service is completed
create or replace function public.handle_appointment_completion_rotation()
returns trigger as $$
declare
  v_old_order integer;
  v_max_order integer;
begin
  -- Only trigger when an appointment is completed (either newly inserted as completed, or updated to completed)
  if (TG_OP = 'INSERT' and new.status = 'completed' and new.employee_id is not null) or
     (TG_OP = 'UPDATE' and new.status = 'completed' and old.status != 'completed' and new.employee_id is not null) then
     
    -- Get the completed employee's current rotation_order
    select rotation_order into v_old_order
    from public.employees
    where id = new.employee_id;
    
    -- Get the maximum rotation_order among all active employees
    select coalesce(max(rotation_order), 0) into v_max_order
    from public.employees
    where is_active = true;
    
    if v_old_order is not null then
      -- Shift all employees who were behind this employee
      update public.employees
      set rotation_order = rotation_order - 1
      where is_active = true 
        and rotation_order > v_old_order;
        
      -- Put this employee at the end of the queue
      update public.employees
      set rotation_order = v_max_order
      where id = new.employee_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_appointment_completed on public.appointments;

create trigger on_appointment_completed
  after insert or update on public.appointments
  for each row execute procedure public.handle_appointment_completion_rotation();


-- 2. Trigger to automatically assign the next rotation_order when a new employee is activated or inserted
create or replace function public.handle_employee_rotation_init()
returns trigger as $$
declare
  v_max_order integer;
begin
  -- Trigger on insert of active employee, or update is_active from false to true
  if (TG_OP = 'INSERT' and new.is_active = true) or
     (TG_OP = 'UPDATE' and new.is_active = true and (old.is_active = false or old.is_active is null)) then
     
    select coalesce(max(rotation_order), -1) into v_max_order
    from public.employees
    where is_active = true and id != new.id;
    
    new.rotation_order := v_max_order + 1;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_employee_activated on public.employees;

create trigger on_employee_activated
  before insert or update on public.employees
  for each row execute procedure public.handle_employee_rotation_init();
