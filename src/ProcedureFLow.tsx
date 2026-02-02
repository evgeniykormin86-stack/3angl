import "./index.css"; // <-- make sure Tailwind CSS is imported here


interface ProcedureFlowProps {
  code: string;
  onChange: (value: string) => void;
}

export default function ProcedureFlow({ code, onChange }: ProcedureFlowProps) {
  code; onChange;
  return (
    <div className="p-6 border rounded shadow-md bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Procedure Flow (Plug)</h2>
      <p className="text-gray-600">This is where procedure logic panel will go.</p>
    </div>
  );
}