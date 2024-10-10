import React, { ReactNode } from "react";
import Sidebar from "./Sidebar"; // Adjust import paths as necessary
import Head from "./Head"; // Adjust import paths as necessary
import styles from "../../styles/main.module.css"; // Adjust import path as necessary
import { Analytics } from "@vercel/analytics/react";

type LayoutProps = {
    children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col h-full w-full">
            <Head />
            <main className={`h-full p-6 mainContent`}>
                <aside className="absolute">
                <Sidebar />
                </aside>
                    {children}
                <Analytics />
            </main>
        </div>
    );
};

export default Layout;
