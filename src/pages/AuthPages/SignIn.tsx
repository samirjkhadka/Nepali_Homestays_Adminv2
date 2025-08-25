import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function SignIn() {
  const { user, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user ) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the sign-in form
  if (user) {
    return null;
  }

  return (
    <>
      <PageMeta
        title="Nepali Homestays | Sign In"
        description="Empowering communities with authentic homestays."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
