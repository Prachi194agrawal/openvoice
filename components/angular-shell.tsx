/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";

export const angularMetadata: Metadata = {
  title: "OpenVoice IIITM",
  description: "Campus-only discussion platform for IIITM students.",
};

export function AngularShell() {
  return (
    <>
      <link rel="stylesheet" href="/angular/styles.css" />
      <div dangerouslySetInnerHTML={{ __html: "<app-root></app-root>" }} />
      <script src="/angular/polyfills.js" type="module" defer />
      <script src="/angular/main.js" type="module" defer />
    </>
  );
}
