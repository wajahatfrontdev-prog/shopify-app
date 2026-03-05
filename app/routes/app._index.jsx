import { useEffect } from "react";
import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app/home", { replace: true });
  }, [navigate]);

  return (
    <div style={{ 
      padding: "40px", 
      textAlign: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      color: "white"
    }}>
      <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>🚀 Loading WajahatEcom...</h2>
      <p style={{ fontSize: "16px", opacity: 0.9 }}>Taking you to the home page...</p>
      <div style={{ 
        marginTop: "20px",
        width: "50px",
        height: "50px",
        border: "3px solid rgba(255,255,255,0.3)",
        borderTop: "3px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "20px auto"
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
