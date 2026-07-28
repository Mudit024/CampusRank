import React from 'react';
import Navbar from './Navbar.jsx';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-[#070b13]">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default Layout;
