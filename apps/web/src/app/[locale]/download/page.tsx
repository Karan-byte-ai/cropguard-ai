"use client";
import { QRCodeSVG } from "qrcode.react";

const APK_URL = "https://cropguard-ai-rho.vercel.app/cropguard.apk";

export default function DownloadPage() {
    return (
        <main className="mx-auto max-w-xl px-4 py-10 text-center">
            <h1 className="mb-2 text-3xl font-bold">Download CropGuard AI</h1>
            <p className="mb-6 text-gray-600">
                Scan this QR code with your Android phone to install the app.
            </p>
            <div className="inline-block rounded-xl bg-white p-4 shadow">
                <QRCodeSVG value={APK_URL} size={220} />
            </div>
            <div className="mt-6">
                <a
                    href="/cropguard.apk"
                    download
                    className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
                >
                    Download APK (Android)
                </a>
            </div>
            <p className="mt-3 text-sm text-gray-500">
                If Android warns about unknown apps, allow it once for your browser.
            </p>
            <div className="mt-8 rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-700">
                <p className="font-semibold">iPhone users</p>
                <p>Open this site in Safari, tap Share, then Add to Home Screen.</p>
            </div>
        </main>
    );
}