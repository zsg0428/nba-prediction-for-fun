import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { SignoutButton } from "@/components/Signout/SignoutButton";

export default async function Home() {
  redirect("/predictions");
}
