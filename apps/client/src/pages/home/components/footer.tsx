import { Separator } from "@reactive-resume/ui";

import { Copyright } from "@/client/components/copyright";
import { Logo } from "@/client/components/logo";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />

    <div className="container grid py-12 sm:grid-cols-3 lg:grid-cols-4">
      <div className="flex flex-col gap-y-2">
        <Logo size={96} className="-ml-2" />

        <Copyright className="mt-6" />
      </div>


    </div>
  </footer>
);
