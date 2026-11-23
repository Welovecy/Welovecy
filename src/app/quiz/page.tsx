import type { Metadata } from "next";
import { Crumbs } from "@/components/Bits";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "How well do you know Cyprus? Take the quiz",
  description: "Ten quick questions about Cyprus: beaches, food, history and the things every visitor should know. Share your score and see if your friends can beat it.",
};

export default function QuizPage() {
  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], ["Quiz"]]} />
        <h1 className="h-hero" style={{ marginTop: 16 }}>How well do you know Cyprus?</h1>
        <p className="lead">Ten questions. No pressure. A fresh set every time you play.</p>
      </div>
      <section className="wrap" aria-label="Quiz">
        <Quiz />
      </section>
    </>
  );
}
