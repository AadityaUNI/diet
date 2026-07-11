import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function HomeButton() {
  const navigate = useNavigate();

  const homeClick = () => {
    navigate("/");
  };

  return (
    <div className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4">
      <Button
        onClick={homeClick}
        className="pointer-events-auto rounded-full px-6 py-6 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
      >
        Home
      </Button>
    </div>
  );
}