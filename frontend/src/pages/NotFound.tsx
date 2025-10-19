
import React from 'react';
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import StarBackground from '../components/StarBackground';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <StarBackground />
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nebula-glow opacity-20 blur-3xl"></div>
      </div>
      
      <div className="nebula-card p-8 max-w-md animate-float">
        <h1 className="text-8xl font-bold text-nebula-500 mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! This page seems to have drifted into deep space.
        </p>
        <Link to="/" className="nebula-button inline-block">
          Return to Base
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
