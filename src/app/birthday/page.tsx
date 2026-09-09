"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { INTRO } from "@/lib/birthday/config";
import { BirthdayCat } from "@/components/birthday/BirthdayCat";
import { DoodleFlower, DoodleHeart } from "@/components/birthday/doodles";
import { FloatingPetals, DoodleDivider } from "@/components/birthday/effects";
import { PageDecor } from "@/components/birthday/PageDecor";

export default function BirthdayIntroPage() {
  const router = useRouter();

  return (
    <div className="bday-center relative">
      <PageDecor theme="flowers" />
      <FloatingPetals count={9} />

      {/* scattered flowers */}
      <DoodleFlower size={34} className="absolute left-[8%] top-[16%] bday-float text-[color:var(--bday-rose)]" />
      <DoodleFlower size={26} className="absolute right-[12%] top-[24%] bday-float text-[color:var(--bday-sage)]" style={{ animationDelay: "1.2s" }} />
      <DoodleFlower size={22} className="absolute left-[18%] bottom-[18%] bday-float text-[color:var(--bday-gold)]" style={{ animationDelay: "2s" }} />

      <div className="bday-paper-card bday-taped bday-max relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="flex items-end justify-center gap-2">
            <BirthdayCat pose="sit" size={150} className="bday-float" />
            <DoodleFlower size={64} className="text-[color:var(--bday-rose)] -ml-6 mb-2" />
            <DoodleFlower size={44} className="text-[color:var(--bday-sage)] mb-6" />
          </div>

          <DoodleDivider />

          <h1 className="bday-h1 px-2">
            {INTRO.lines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.4, duration: 0.6 }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.button
            className="bday-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/birthday/journey")}
          >
            {INTRO.button}
          </motion.button>

          <p className="bday-scrawl text-sm opacity-60 pb-1">
            a handmade little world, just for you
          </p>
        </motion.div>
      </div>

      <DoodleHeart size={20} className="absolute bottom-6 right-8 text-[color:var(--bday-blush)]" />
    </div>
  );
}
