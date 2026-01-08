import logo from "/logo.svg";

const Logo = () => {
  return (
    <img
      src={logo}
      className="p-0.5 hover:bg-accent/90 rounded-md transition-all"
    />
  );
};

export default Logo;
