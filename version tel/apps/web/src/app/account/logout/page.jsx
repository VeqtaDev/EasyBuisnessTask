import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">EBT</h1>
        <p className="mb-8 text-center text-sm text-[#888888]">
          Easy Business Task
        </p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-white px-4 py-3 text-base font-semibold text-black transition-all hover:bg-[#e5e5e5] focus:outline-none"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default MainComponent;
