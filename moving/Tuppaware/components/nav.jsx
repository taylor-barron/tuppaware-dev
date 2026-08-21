import { useState } from "react";
import { replaceDefaults } from "../utils/replacedefaults";
import useIsBelowBreakPoint from "../utils/watchmobilebreakpoint";
import FlexBox from '../containers/flexbox';
import Icon from "../text/icon";
import Image from "../assets/image";

export default function Nav({
  mobileBreakpoint = 768,
  className = "",
  style = {},
  pinToTop = false,
  pinMarginTop = "0",
  pinMarginTopColor = "#d8d8d8",

  logo = "",
  logoUrl = "",
  defaultLogoUrl = "/",
  logoStyle = {},
  defaultLogoStyle = { height: "40px", width: "auto", margin: "0 1rem", cursor: "pointer" },

  navItems = [],
  navItemsPinning = "left",

  desktopNavStyle = {},
  defaultDesktopNavStyle = { display: "flex", flexDirection: "row", alignItems: "center", width: "100%", backgroundColor: "#d8d8d8", padding: "0.5rem 1rem" },
  desktopNavItemContainerStyle = {},
  defaultDesktopNavItemContainerStyle = { display: "flex", flexDirection: "row", alignItems: "center", position: "relative" },
  desktopNavItemStyle = {},
  defaultDesktopNavItemStyle = { margin: "0 0.5rem", cursor: "pointer", display: "inline-flex", alignItems: "center" },
  desktopNavSubItemStyle = {},
  defaultDesktopNavSubItemStyle = { display: "block", padding: "0.25rem 0.5rem", cursor: "pointer" },
  desktopTopNavSubItemMargin = "0.5rem",
  desktopNavSubItemContainerStyle = {},
  defaultDesktopNavSubItemContainerStyle = { position: "absolute", top: "100%", left: 0, minWidth: "180px", padding: "0.5rem", zIndex: 1100 },
  NavSubItemHoverColor = "#f0f0f0",
  desktopNavSubItemClass = "",

  mobileNavStyle = {},
  defaultMobileNavStyle = { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: "#d8d8d8", padding: "0.25rem 0.75rem" },
  mobileOpenCloseIconStyle = {},
  defaultMobileOpenCloseIconStyle = { fontSize: "1.3rem", height: "100%", cursor: "pointer" },
  mobileNavItemContainerStyle = {},
  defaultMobileNavItemContainerStyle = { width: "100%", padding: "0.5rem 1rem", marginTop: "0.25rem", zIndex: 1000  },
  mobileNavOpenIcon = "fa fa-bars",
  mobileNavCloseIcon = "fa fa-times",
  mobileNavSubItemContainerStyle = {},
  defaultMobileNavSubItemContainerStyle = { marginLeft: "1rem" },

  navItemIconStyle = {},
  defaultNavItemIconStyle = { marginRight: "0.25rem" },

  mobileNavItemStyle = {},
  defaultMobileNavItemStyle = { margin: "0.5rem 0", cursor: "pointer" },
  mobileNavSubItemStyle = {},
  defaultMobileNavSubItemStyle = { display: "block", padding: "0.25rem 0.5rem", cursor: "pointer" },

  ...props
}) {
  const isMobile = useIsBelowBreakPoint(mobileBreakpoint);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mergedDesktopNavStyle = pinToTop ? { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000, ...replaceDefaults(defaultDesktopNavStyle, desktopNavStyle) } :
    replaceDefaults(defaultDesktopNavStyle, desktopNavStyle);
  const mergeMobileNavStyle = pinToTop ? { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000, ...replaceDefaults(defaultMobileNavStyle, mobileNavStyle) } :
    replaceDefaults(defaultMobileNavStyle, mobileNavStyle);
  const navBackgroundColor = isMobile ? mergeMobileNavStyle.backgroundColor : (mergedDesktopNavStyle.backgroundColor ? mergedDesktopNavStyle.backgroundColor : "#d8d8d8");
  const [openSubMenuIndex, setOpenSubMenuIndex] = useState(null);

  const desktopNavItemContainerStyleObject = replaceDefaults(defaultDesktopNavItemContainerStyle, desktopNavItemContainerStyle);
  const desktopNavItemStyleObject = replaceDefaults(defaultDesktopNavItemStyle, desktopNavItemStyle);
  const desktopNavSubItemContainerStyleObject = replaceDefaults({ backgroundColor: navBackgroundColor, ...defaultDesktopNavSubItemContainerStyle }, desktopNavSubItemContainerStyle);

  const mobileOpenCloseIconStyleObject = replaceDefaults(defaultMobileOpenCloseIconStyle, mobileOpenCloseIconStyle);
  const mergedMobileNavItemContainerStyle = pinToTop ? { position: "fixed", backgroundColor: navBackgroundColor, ...replaceDefaults(defaultMobileNavItemContainerStyle, mobileNavItemContainerStyle) } : 
    { position: "relative", backgroundColor: navBackgroundColor, ...replaceDefaults({ ...defaultMobileNavItemContainerStyle, marginTop: 0, paddingTop: 0}, mobileNavItemContainerStyle) };
  const mergedMobileNavSubItemContainerStyle = replaceDefaults({ ...defaultMobileNavSubItemContainerStyle, backgroundColor: navBackgroundColor }, mobileNavSubItemContainerStyle);

  const logoStyleObject = replaceDefaults(defaultLogoStyle, logoStyle);
  const navItemIconStyleObject = replaceDefaults(defaultNavItemIconStyle, navItemIconStyle);

  const hasSubItems = (item) => item.subItems && item.subItems.length > 0;
  const navSubItemStyleObject = isMobile ? replaceDefaults(defaultMobileNavSubItemStyle, mobileNavSubItemStyle) : replaceDefaults(defaultDesktopNavSubItemStyle, desktopNavSubItemStyle);

  const desktopItemsWrapperStyle =
    navItemsPinning === "right"
      ? { marginLeft: "auto", display: "flex", alignItems: "center" }
      : navItemsPinning === "center"
      ? { margin: "0 auto", display: "flex", alignItems: "center" }
      : { display: "flex", alignItems: "center" };

  return (
    <>
      {pinToTop && <FlexBox style={{ minHeight: pinMarginTop, backgroundColor: pinMarginTopColor }}></FlexBox>}

      {isMobile ? (
        <>
          <nav className={className} style={mergeMobileNavStyle} {...props}>
            {logo && <Image src={logo} alt="Logo" style={logoStyleObject} url={logoUrl || defaultLogoUrl} />}

            <Icon
              className={mobileNavOpen ? mobileNavCloseIcon : mobileNavOpenIcon}
              style={mobileOpenCloseIconStyleObject}
              onClick={() => setMobileNavOpen((prev) => !prev)}
            />
          </nav>

          {mobileNavOpen && (
            <FlexBox direction="column" horizontal="left" vertical="top" style={mergedMobileNavItemContainerStyle}>
              {navItems.map((item, index) => (
                <FlexBox key={`${item.title}-${index}`} direction="column" horizontal="left" vertical="top">
                  <a href={item.url} style={replaceDefaults(defaultMobileNavItemStyle, mobileNavItemStyle)}>
                    {item.icon && <Icon className={item.icon} style={navItemIconStyleObject} />}
                    {item.title}
                  </a>

                  {hasSubItems(item) && (
                    <FlexBox direction="column" horizontal="left" vertical="top" style={mergedMobileNavSubItemContainerStyle}>
                      {item.subItems.map((subItem, subIndex) => (
                        <a
                          key={`${subItem.title}-${subIndex}`}
                          href={subItem.url}
                          style={replaceDefaults(defaultMobileNavSubItemStyle, mobileNavSubItemStyle)}
                        >
                          {subItem.icon && <Icon className={subItem.icon} style={navItemIconStyleObject} />}
                          {subItem.title}
                        </a>
                      ))}
                    </FlexBox>
                  )}
                </FlexBox>
              ))}
            </FlexBox>
          )}
        </>
      ) : (
        <nav className={className} style={mergedDesktopNavStyle} {...props}>
          {logo && <Image src={logo} alt="Logo" style={logoStyleObject} url={logoUrl || defaultLogoUrl} />}

          <FlexBox direction="row" horizontal="left" vertical="center" style={desktopItemsWrapperStyle}>
            {navItems.map((item, index) => (
              <FlexBox
                key={`${item.title}-${index}`}
                style={desktopNavItemContainerStyleObject}
                onMouseEnter={() => setOpenSubMenuIndex(index)}
                onMouseLeave={() => setOpenSubMenuIndex((prev) => (prev === index ? null : prev))}
              >
                <a href={item.url} style={desktopNavItemStyleObject}>
                  {item.icon && <Icon className={item.icon} style={navItemIconStyleObject} />}
                  {item.title}
                </a>

                {hasSubItems(item) && (
                  <Icon className="fa fa-caret-down" style={navItemIconStyleObject} />
                )}

                {hasSubItems(item) && openSubMenuIndex === index && (
                  <FlexBox style={desktopNavSubItemContainerStyleObject} direction="column" horizontal="left" vertical="top">
                    {item.subItems.map((subItem, subIndex) => (
                      <a
                        key={`${subItem.title}-${subIndex}`}
                        href={subItem.url}
                        className={desktopNavSubItemClass}
                        style={{
                          ...navSubItemStyleObject,
                          marginTop: subIndex === 0 ? desktopTopNavSubItemMargin : "0",
                        }}
                      >
                        {subItem.icon && <Icon className={subItem.icon} style={navItemIconStyleObject} />}
                        {subItem.title}
                      </a>
                    ))}
                  </FlexBox>
                )}
              </FlexBox>
            ))}
          </FlexBox>
        </nav>
      )}
    </>
  );
}