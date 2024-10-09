import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import SocketInitializer from "@/components/SocketInitializer";
import NotificationComponent from "@/components/ConnectionNotification";
import CallNotification from "@/components/CallNofication";
import Videocall from "@/components/VideoCall";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VerboFly",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketInitializer/>
        {children}
        <NotificationComponent/>
        <CallNotification/>
        <Videocall/>
        </body>
    </html>
  );
}