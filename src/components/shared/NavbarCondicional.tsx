"use client";
import {usePathname} from "next/navigation";
import Navbar from "./navbar";

export default function NavbarCondicional() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Navbar />;
}