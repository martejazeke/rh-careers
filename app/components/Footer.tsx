import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Mail,
  Phone,
  Icon,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#fafafa] to-[#f8fafc] pt-16 overflow-hidden relative">
      <img
        alt="Rebus Umbrella"
        src={"/images/Umbrella.svg"}
        className="absolute top-70 right-0 w-180 opacity-100 pointer-events-none md:top-10 lg:top-0"
      />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12">
          {/* Branding - Left Side */}
          <div>
            <div className="h-auto w-25 mb-6">
              <img
                alt="Rebus Holdings Logo"
                className="h-full w-full object-cover"
                src={"/images/logo.png"}
              />
            </div>
            <p className="font-sans text-base text-primary/70 leading-[1.6] mb-6">
              We aim to promote and implement the latest industry trends in our
              projects to provide our clients with highest quality and
              sustainability.
            </p>
          </div>

          {/* Right Side - 3 Categories */}
          <div className="grid grid-cols-2 gap-8">
            {/* Contact */}
            <div>
              <h3 className="font-header font-medium text-xl text-primary mb-6">
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-[20px] h-[20px] text-primary mt-1 md:w-24 2xl:size-14" />
                  <a
                    href="https://maps.app.goo.gl/JeyRuEGn1ssHu93V7"
                    className="font-sans text-base text-primary/70 hover:text-primary transition-colors"
                  >
                    PO Box 3282, Office 1203–1204, Sultan International Tower,
                    Corniche, Abu Dhabi, UAE
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-auto text-primary mt-1" />
                  <a
                    href="tel:+97126729802"
                    className="font-sans text-base text-primary/70 hover:text-primary transition-colors"
                  >
                    +971 2 672 9802
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-auto text-primary mt-1" />
                  <a
                    href="mailto:admin@rebus.ae"
                    className="font-sans text-base text-primary/70 hover:text-primary transition-colors"
                  >
                    admin@rebus.ae
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-header font-medium text-xl text-primary mb-6">
                Connect with Us
              </h3>
              <div className="flex gap-2">
                {[
                  {
                    Icon: Linkedin,
                    href: "https://www.linkedin.com/company/rebusholdings/",
                    label: "LinkedIn",
                  },
                  {
                    Icon: Twitter,
                    href: "https://x.com/rebus1996/",
                    label: "Twitter",
                  },
                  {
                    Icon: Instagram,
                    href: "https://www.instagram.com/rebus_holdings_llc/",
                    label: "Instagram",
                  },
                  {
                    Icon: Facebook,
                    href: "https://www.facebook.com/rebuscloseout",
                    label: "Facebook",
                  },
                ].map(
                  (
                    { Icon, href, label },
                    idx
                  ) => (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="size-8 bg-[#425b7d] rounded-full flex items-center justify-center hover:bg-primary text-white transition-all hover:-translate-y-1"
                    >
                      <Icon className="size-4" />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
