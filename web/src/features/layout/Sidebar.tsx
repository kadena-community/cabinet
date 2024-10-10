import React from "react";
import SidebarItems from "./SidebarItems"; // Import SidebarItems component

const Sidebar = () => {
    return (
        <div className="hidden md:block">
            <div className="sidebar">
                <SidebarItems />
            </div>
        </div>
    );
};

export default Sidebar;
