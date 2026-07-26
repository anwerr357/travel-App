import { redirect } from "react-router";

export const loader = () => redirect("/Dashboard");

export default function Home() {
  return null;
}
