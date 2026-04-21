
import React, { Component, ErrorInfo, ReactNode } from "react";
import { IconBook, IconArrowRight } from "../constants";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-white">
            <div className="absolute inset-0 z-0 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            </div>

            <div className="max-w-md w-full relative z-10 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-white">
                    <IconBook className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Neural Fault</h1>
                <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
                    A critical exception occurred in the EbookStudio workspace. Your data is safe, but the interface needs to reset.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase mb-2 tracking-widest">Stack Trace Preview</p>
                    <p className="text-xs font-mono text-white/60 overflow-hidden text-ellipsis whitespace-nowrap">
                        {this.state.error?.message || "Unknown Runtime Error"}
                    </p>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-all shadow-glow-white flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    Initialize Recovery <IconArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
