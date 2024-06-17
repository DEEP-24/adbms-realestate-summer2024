"use client";

import { Link } from "@remix-run/react";

const Logo = () => {
  return (
    <Link to="/">
      <div className="flex items-center justify-center">
        <img
          className="hidden md:block cursor-pointer"
          src="/logo.png"
          height="100"
          width="100"
          alt="Logo"
        />
        <span className="text-2xl">Real Estate</span>
      </div>
    </Link>
  );
};

export default Logo;
