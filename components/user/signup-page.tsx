"use client";

import Image from "next/image";
import SignupComponent from "./signup-component";

export default function SignupPage() {
  return (
    <div id="sign-in" className="sign-in section panel h-100" style={{ backgroundColor: "#f6f8fb" }}>
      <div className="section-outer panel">
        <div className="section-inner panel">
          <div className="panel">
            <div className="panel row child-cols-12 md:child-cols-6 g-0">
              <div className="order-2 d-none lg:d-block md:order-1">
                <div className="panel overflow-hidden min-h-300px lg:h-screen">
                  <figure className="panel m-0 rounded" style={{ position: "relative", height: "100%" }}>
                    <canvas style={{ height: "100%", width: "100%" }} />
                    <Image className="media-cover image" alt="Hero login image" src="/assets/images/common/Homepage_Partner_.jpg" fill style={{ objectFit: "cover" }} priority />
                  </figure>
                  <div className="position-cover text-white vstack justify-end p-4 lg:p-6 xl:py-8">
                    <div className="position-cover from-black to-transparent opacity-50" />
                  </div>
                </div>
              </div>
              <div className="order-2 md:order-2">
                <div className="panel vstack justify-center h-100 overflow-hidden">
                  <div className="w-full px-4 py-2 md:p-0 h-100">
                    <div className="position-absolute rotate-45 d-none lg:d-block" style={{ bottom: "15%", left: "18%" }}>
                      <img className="w-32px text-gray-900 dark:text-white" width={193} height={216} alt="star-1" src="/assets/images/template/star-1.svg" />
                    </div>
                    <div className="position-absolute rotate-45 d-none lg:d-block" style={{ top: "15%", right: "18%" }}>
                      <img className="w-24px text-gray-900 dark:text-white" width={69} height={95} alt="star-2" src="/assets/images/template/star-2.svg" />
                    </div>
                    <SignupComponent />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
