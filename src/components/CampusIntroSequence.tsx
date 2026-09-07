import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion"
import { useRef } from "react"
import type { Club } from "@/generated/prisma/client"
import type { PresentationProfessionalBody } from "@/lib/presentation-fixtures"
import { ClubMark } from "@/components/clubboard/club-identity"

type IntroClub = {
  club: Club
  settled: [number, number]
  collection: [number, number]
  rotation: number
  scale: number
  enterRange: [number, number]
  collectRange: [number, number]
}

const clubLayout: Array<[number, number, number, number]> = [
  [-34, -25, -4, .9], [0, -29, 3, 1], [34, -23, -3, .92],
  [-42, 7, 3, .88], [-14, 5, -2, .96], [17, 8, 4, .9], [43, 8, -3, .86],
  [-31, 34, -3, .88], [3, 31, 2, .92], [35, 34, -4, .86],
  [-5, -4, 3, .82], [19, -2, -2, .82],
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function makeIntroClubs(clubs: Club[]): IntroClub[] {
  return clubs.slice(0, clubLayout.length).map((club, index) => {
    const [x, y, rotation, scale] = clubLayout[index]
    return {
      club,
      settled: [x, y],
      collection: [clamp(-x * .38, -18, 18), clamp(-y * .35, -14, 14)],
      rotation,
      scale,
      enterRange: [.23 + index * .021, .29 + index * .021],
      collectRange: [.58 + (index % 4) * .018, .72 + (index % 4) * .018],
    }
  })
}

function IntroClubCard({ item, progress, reducedMotion }: { item: IntroClub; progress: MotionValue<number>; reducedMotion: boolean }) {
  const [settledX, settledY] = item.settled
  const [collectionX, collectionY] = item.collection
  const xMotion = useTransform(progress, [0, item.enterRange[0], item.enterRange[1], item.collectRange[0], item.collectRange[1], 1], [settledX - 34, settledX - 34, settledX, settledX, collectionX, collectionX], { clamp: true })
  const yMotion = useTransform(progress, [0, item.enterRange[0], item.enterRange[1], item.collectRange[0], item.collectRange[1], 1], [settledY - 30, settledY - 30, settledY, settledY, collectionY, collectionY], { clamp: true })
  const rotateMotion = useTransform(progress, [0, item.enterRange[0], item.enterRange[1], item.collectRange[0], item.collectRange[1], 1], [item.rotation - 8, item.rotation - 8, item.rotation, item.rotation, item.rotation + 12, item.rotation + 12])
  const scaleMotion = useTransform(progress, [0, item.enterRange[0], item.enterRange[1], item.collectRange[0], item.collectRange[1], 1], [.72, .72, item.scale, item.scale, .52, .52])
  const opacityMotion = useTransform(progress, [0, item.enterRange[0], item.enterRange[1], item.collectRange[0], item.collectRange[1], .76], [0, 0, 1, 1, 1, 0])
  const xPercent = useTransform(xMotion, (value) => `${value}%`)
  const yPercent = useTransform(yMotion, (value) => `${value}%`)

  return (
    <motion.div className="intro-club-card" style={{ x: reducedMotion ? `${settledX}%` : xPercent, y: reducedMotion ? `${settledY}%` : yPercent, rotate: reducedMotion ? item.rotation : rotateMotion, scale: reducedMotion ? item.scale : scaleMotion, opacity: reducedMotion ? 1 : opacityMotion }}>
      <ClubMark club={item.club} size="sm" />
      <span className="intro-club-name">{item.club.name}</span>
    </motion.div>
  )
}

function CardboardBox({ progress, reducedMotion }: { progress: MotionValue<number>; reducedMotion: boolean }) {
  const scaleMotion = useTransform(progress, [.58, .70, .82, .90, 1], [.55, 1, 1, .92, .88])
  const opacityMotion = useTransform(progress, [.55, .63, .74, .86, .90, 1], [0, 1, 1, 1, 0, 0])
  const rotateMotion = useTransform(progress, [.58, .72, .84], [-5, 1, 0])
  return (
    <motion.div className="intro-box-wrap" style={{ scale: reducedMotion ? 1 : scaleMotion, opacity: reducedMotion ? 1 : opacityMotion, rotate: reducedMotion ? 0 : rotateMotion }} aria-label="Open cardboard box collecting the campus clubs">
      <div className="intro-box-shadow" />
      <div className="intro-box">
        <div className="intro-box-back-flap" />
        <div className="intro-box-interior" />
        <div className="intro-box-front" />
        <div className="intro-box-left-flap" />
        <div className="intro-box-right-flap" />
      </div>
      <span className="intro-box-label">CAMPUS / ARCHIVE</span>
    </motion.div>
  )
}

function ProfessionalBodyCards({ bodies, progress, reducedMotion }: { bodies: PresentationProfessionalBody[]; progress: MotionValue<number>; reducedMotion: boolean }) {
  return (
    <div className="intro-professional-cards" aria-label="Professional bodies inside the box">
      {bodies.map((body, index) => {
        const positions = [[-24, -5, -4], [23, -3, 3], [-20, 16, 3], [21, 17, -3]]
        const [x, y, rotation] = positions[index]
        const cardXMotion = useTransform(progress, [.77, .84, .94, 1], [x * 2.2, x, x, x])
        const cardYMotion = useTransform(progress, [.77, .84, .94, 1], [y * 2.2, y, y, y])
          const cardOpacityMotion = useTransform(progress, [.77, .82, .86, .89, .91, 1], [0, 0, 1, 1, 0, 0])
        const cardXPercent = useTransform(cardXMotion, (value) => `${value}%`)
        const cardYPercent = useTransform(cardYMotion, (value) => `${value}%`)
        return (
          <motion.div key={body.id} className="intro-professional-card" style={{ x: reducedMotion ? `${x}%` : cardXPercent, y: reducedMotion ? `${y}%` : cardYPercent, rotate: rotation, opacity: reducedMotion ? 1 : cardOpacityMotion }}>
            {body.logoUrl ? <img src={body.logoUrl} alt={`${body.name} official logo`} /> : <span className="intro-asset-slot">OFFICIAL ASSET<br />PENDING</span>}
            <strong>{body.name}</strong>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function CampusIntroSequence({ clubs, professionalBodies }: { clubs: Club[]; professionalBodies: PresentationProfessionalBody[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress: rawProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] })
  const progress = useSpring(rawProgress, { stiffness: 90, damping: 24 })
  const introClubs = makeIntroClubs(clubs)
  const openingOpacityMotion = useTransform(progress, [0, .06, .09, .13, .20], [0, 0, 1, 1, 0])
  const openingYMotion = useTransform(progress, [.08, .18, .28], [20, 0, -8])
    const belongOpacityMotion = useTransform(progress, [.89, .92, .94, .98, 1], [0, 0, 1, 1, 0])
  const dashboardFadeMotion = useTransform(progress, [.94, .97, 1], [0, .45, 1])

  return (
    <section ref={sectionRef} className={`campus-introduction ${reducedMotion ? "is-reduced" : ""}`} aria-label="Campus introduction">
      <div className="campus-introduction-stage campus-paper">
        <motion.div className="intro-stage intro-stage-opening intro-opening" style={{ opacity: reducedMotion ? 1 : openingOpacityMotion, y: reducedMotion ? 0 : openingYMotion }}>
          <p className="intro-eyebrow">THE CAMPUS ECOSYSTEM</p>
          <h2>EVERYTHING<br /><em>HAPPENS HERE.</em></h2>
          <p className="intro-supporting-copy">Communities drift into focus as you move through campus.<br />Clubs, people, and professional bodies are already in motion.</p>
        </motion.div>

        <div className="intro-stage intro-stage-clubs intro-club-field" aria-label="Campus clubs arriving one by one">
          {introClubs.map((item) => <IntroClubCard key={item.club.id} item={item} progress={progress} reducedMotion={Boolean(reducedMotion)} />)}
        </div>

        <div className="intro-stage intro-stage-collection"><CardboardBox progress={progress} reducedMotion={Boolean(reducedMotion)} /></div>
        <div className="intro-stage intro-stage-box"><ProfessionalBodyCards bodies={professionalBodies} progress={progress} reducedMotion={Boolean(reducedMotion)} /></div>

        <motion.div className="intro-stage intro-stage-belonging intro-belonging" style={{ opacity: reducedMotion ? 1 : belongOpacityMotion }}>
          <p className="intro-eyebrow">THE CAMPUS ECOSYSTEM</p>
          <h2>FIND WHERE<br /><em>YOU BELONG.</em></h2>
          <p className="intro-supporting-copy">Discover the clubs, communities, and professional bodies that make campus feel like yours.</p>
        </motion.div>
        <motion.div className="intro-dashboard-wash" style={{ opacity: reducedMotion ? 0 : dashboardFadeMotion }} aria-hidden="true" />
      </div>
    </section>
  )
}
