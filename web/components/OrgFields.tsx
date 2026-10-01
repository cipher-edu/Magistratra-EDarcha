import type { OrgFaculty } from "@/lib/db";

export function OrgFields({
  org,
  faculty,
  department,
  specialty,
  onChange,
}: {
  org: OrgFaculty[];
  faculty: string;
  department: string;
  specialty: string;
  onChange: (next: { faculty: string; department: string; specialty: string }) => void;
}) {
  const facultyRow = org.find((item) => item.name === faculty);
  const departments = facultyRow?.departments ?? [];
  const departmentRow = departments.find((item) => item.name === department);
  const specialties = departmentRow?.specialties ?? [];
  const facultyOptions = unique([faculty, ...org.map((item) => item.name)].filter(Boolean));
  const departmentOptions = unique([department, ...departments.map((item) => item.name)].filter(Boolean));
  const specialtyOptions = unique([specialty, ...specialties.map((item) => item.name)].filter(Boolean));

  return (
    <>
      <div className="field">
        <label htmlFor="faculty">Fakultet</label>
        <select
          id="faculty"
          value={faculty}
          onChange={(event) => {
            const nextFaculty = org.find((item) => item.name === event.target.value);
            const nextDepartment = nextFaculty?.departments[0];
            onChange({
              faculty: event.target.value,
              department: nextDepartment?.name ?? "",
              specialty: nextDepartment?.specialties[0]?.name ?? "",
            });
          }}
          required
        >
          {facultyOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="department">Kafedra</label>
        <select
          id="department"
          value={department}
          onChange={(event) => {
            const nextDepartment = departments.find((item) => item.name === event.target.value);
            onChange({
              faculty,
              department: event.target.value,
              specialty: nextDepartment?.specialties[0]?.name ?? "",
            });
          }}
          required
        >
          {departmentOptions.length === 0 ? <option value="">Kafedra yo‘q</option> : null}
          {departmentOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="specialty">Mutaxassislik</label>
        <select id="specialty" value={specialty} onChange={(event) => onChange({ faculty, department, specialty: event.target.value })} required>
          {specialtyOptions.length === 0 ? <option value="">Mutaxassislik yo‘q</option> : null}
          {specialtyOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function unique(values: string[]) {
  return [...new Set(values)];
}
