import { Metadata } from "next";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers | Rebus Holdings",
  description:
    "Explore career opportunities at Rebus Holdings and join our dynamic team.",
};

export default function CareersPage() {
  return <CareersClient/>;
}
