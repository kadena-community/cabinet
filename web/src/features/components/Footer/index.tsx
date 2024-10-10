import Link from "next/link";
import Image from "next/image";
import IconLink from "@/features/components/Footer/Link";
import CabinetLogo from "@/assets/images/cabinetLogo.svg";
import footerLinks from "./footerLinks.json";
import * as FaIcons from "react-icons/fa";

interface SocialLink {
  title: string;
  url: string;
  icon: string;
}

interface MainLink {
  title: string;
  url: string;
}

interface MainSection {
  section: string;
  links: MainLink[];
}

interface FooterLinks {
  socialLinks: SocialLink[];
  mainLinks: MainSection[];
  bottomLinks: MainLink[];
}

const iconMap: { [key: string]: React.ComponentType } = {
  FaTwitter: FaIcons.FaTwitter,
  FaTelegramPlane: FaIcons.FaTelegramPlane,
  FaDiscord: FaIcons.FaDiscord,
  FaMedium: FaIcons.FaMedium,
  FaYoutube: FaIcons.FaYoutube,
  FaLinkedin: FaIcons.FaLinkedin,
  FaReddit: FaIcons.FaReddit,
  FaGithub: FaIcons.FaGithub,
};

const Footer = () => {
  const footerData = footerLinks as FooterLinks;

  return (
    <footer className="bg-k-Cream-700 dark:bg-k-Blue-default dark:text-k-Cream-default font-kadena py-8">
      <div className="container mx-auto px-4">
        {/* TOP SECTION */}
        <div className="flex flex-col xl:flex-row justify-between gap-14 border-t border-k-Blue-500 pt-8">
          {/* LEFT (LOGO AND SOCIALS) SECTION */}
          <div className="flex flex-col gap-8 mt-12 items-center xl:items-start">
            <a href="https://kadena.io/cabinet">
              <div className="flex h-12 w-auto">
                <CabinetLogo/>
              </div>
            </a>

            {/* SOCIAL SECTION */}
            <div className="flex flex-col gap-x-14 gap-y-10 min-w-[16.5rem]">
              <div className="font-bold text-lg font-Space-Grotesk">
                Join the Community
              </div>
              <ul className="grid grid-cols-4 gap-16">
                {footerData.socialLinks.map((social) => {
                  const Icon = iconMap[social.icon];
                  return (
                    <li key={social.title}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="[&>svg]:w-6 [&>svg]:h-6 [&>svg]:hover:-translate-y-1 [&>svg]:duration-300 [&>svg]:hover:transform [&>svg]:transition-all [&>svg]:hover:scale-[115%]"
                      >
                        <span className="sr-only">{social.title}</span>
                        {Icon ? <Icon /> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RIGHT (MAIN LINKS) SECTION */}
          <ul className="flex flex-col lg:flex-row mt-12 sm:max-lg:items-center gap-8 w-full xl:max-w-[55.25rem]">
            {footerData.mainLinks.map((section) => (
              <li
                key={section.section}
                className="flex sm:w-1/2 xl:flex-1 flex-col gap-4 lg:items-center text-center"
              >
                <div className="font-bold items-center font-Space-Grotesk text-lg">
                  {section.section}
                </div>
                <ul className="flex flex-col items-center gap-4">
                  {section.links.map((link) => (
                    <li
                      key={link.title}
                      className="hover:-translate-y-1 transition-all duration-300"
                    >
                      <IconLink text={link.title} href={link.url} noTriangle />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

        </div>

        {/* BOTTOM (COPYRIGHT) SECTION */}
        <div className="flex flex-wrap justify mt-32 py-4">
          <div className="text-sm">
            &copy; Kadena LLC {new Date().getFullYear()}
          </div>
          <div className="md:ml-36 max-md:mt-12 max-md:justify-start flex gap-8">
            {footerData.bottomLinks.map((link) => (
              <Link
                key={link.title}
                href={link.url}
                className="text-sm hover:text-k-Blue-200"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
