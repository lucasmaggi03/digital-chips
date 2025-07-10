// src/components/ButtonIndex.tsx
import { Link } from "react-router-dom";

interface ButtonIndexProps {
  to: string;
  label: string;
  color?: string;
}

const ButtonIndex = ({ to, label, color = "bg-blue-600 hover:bg-blue-700" }: ButtonIndexProps) => {
  return (
    <Link
      to={to}
      className={`${color} text-white px-6 py-3 rounded-lg shadow transition`}
    >
      {label}
    </Link>
  );
};

export default ButtonIndex;
