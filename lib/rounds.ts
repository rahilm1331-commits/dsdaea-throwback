export type RoundKey = "throwback" | "ascension" | "ignition";

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RoundDefinition = {
  key: RoundKey;
  name: string;
  subtitle: string;
  themeClass: string;
  durationSeconds: number;
  questions: QuizQuestion[];
};

export const QUIZ_DURATION_SECONDS = 30;
export const QUESTIONS_PER_ROUND = 10;

export const ASCENSION_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: "An aircraft is flying straight and level. The pilot increases thrust, but does not change anything else initially. What is most likely to happen?", options: ["The aircraft accelerates forward", "The aircraft immediately stalls", "Weight decreases", "Drag becomes zero"], correctIndex: 0, explanation: "With thrust increased while the aircraft is otherwise initially unchanged, thrust exceeds drag and the aircraft accelerates forward." },
  { id: 2, question: "An aircraft is maintaining constant speed but begins to descend. Which situation could explain this?", options: ["Lift has become less than weight", "Thrust has become greater than drag", "Lift has become greater than weight", "Weight has become zero"], correctIndex: 0, explanation: "If lift becomes less than weight, the remaining downward force can produce a descent while speed can remain approximately constant." },
  { id: 3, question: "A pilot wants to maintain altitude while slowing the aircraft down. Which change can help generate more lift at the lower speed?", options: ["Increase Angle of Attack", "Decrease Angle of Attack", "Reduce wing area", "Increase weight"], correctIndex: 0, explanation: "Increasing angle of attack can increase lift at a lower speed, provided the wing remains below its critical angle of attack." },
  { id: 4, question: "A pilot increases Angle of Attack significantly while flying at a relatively low speed. What aerodynamic effect is likely?", options: ["Drag increases", "Drag disappears", "Thrust automatically increases", "Weight decreases"], correctIndex: 0, explanation: "Increasing angle of attack generally increases drag, and at sufficiently high angle of attack can lead toward stall." },
  { id: 5, question: "You're choosing between two aircraft for a long-distance glide. Aircraft A has a higher L/D ratio than Aircraft B. Which statement is most relevant?", options: ["A can generally glide more efficiently", "A will always fly faster", "A cannot stall", "A must have a more powerful engine"], correctIndex: 0, explanation: "A higher lift-to-drag ratio means the aircraft can generally achieve a better glide efficiency under comparable conditions." },
  { id: 6, question: "A pilot is flying slowly and notices the aircraft approaching its critical Angle of Attack. They want to avoid a stall. Which action should they take?", options: ["Reduce Angle of Attack", "Increase Angle of Attack further", "Pull the nose up harder", "Increase bank angle"], correctIndex: 0, explanation: "Reducing angle of attack moves the wing away from the critical angle and helps restore attached airflow." },
  { id: 7, question: "Two aircraft are approaching the runway at relatively low speeds. Aircraft A deploys its flaps while Aircraft B doesn't. What is one major advantage Aircraft A gains?", options: ["It can generate more lift at low speeds", "It eliminates drag", "It eliminates weight", "It no longer needs thrust"], correctIndex: 0, explanation: "Flaps increase the wing's lift capability at low speeds, allowing slower flight for takeoff or landing, although they also add drag." },
  { id: 8, question: "A pilot wants to pitch the nose upward. Which control surface is primarily responsible?", options: ["Rudder", "Aileron", "Elevator", "Flap"], correctIndex: 2, explanation: "The elevator primarily controls pitch by changing the aerodynamic moment about the aircraft's lateral axis." },
  { id: 9, question: "Which statement is TRUE?", options: ["A stall only occurs when an aircraft's speed becomes too low", "A stall occurs when the wing exceeds its critical angle of attack", "A stall means the engine has stopped", "A stall can only happen during landing"], correctIndex: 1, explanation: "A stall occurs when the wing exceeds its critical angle of attack and lift is significantly reduced. It can occur at different airspeeds." },
  { id: 10, question: "A pilot uses the rudder and the aircraft's nose moves left, while the wings remain approximately level. What motion is occurring?", options: ["Roll about the longitudinal axis", "Pitch about the lateral axis", "Yaw about the vertical axis", "Stall about the vertical axis"], correctIndex: 2, explanation: "Yaw is rotation about the aircraft's vertical axis and is the primary motion produced by the rudder." },
];

export const IGNITION_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: "A rocket carries an oxidizer mainly because it cannot rely on atmospheric oxygen when operating outside the atmosphere. What is the key reason for carrying it?", options: ["To support combustion", "To increase the rocket's mass", "To increase atmospheric pressure", "To cool the payload"], correctIndex: 0, explanation: "The oxidizer supplies the oxygen needed to support combustion when atmospheric oxygen is unavailable." },
  { id: 2, question: "A rocket must push against the atmosphere in order to produce thrust.", options: ["True", "False"], correctIndex: 1, explanation: "A rocket produces thrust by accelerating propellant and does not need to push against the atmosphere, so it can produce thrust in vacuum." },
  { id: 3, question: "In a liquid rocket engine, which pair is normally stored separately before being brought into the combustion chamber?", options: ["Fuel and exhaust", "Fuel and oxidizer", "Oxidizer and exhaust", "Fuel and nozzle gas"], correctIndex: 1, explanation: "Liquid rocket engines normally store fuel and oxidizer separately and bring them together in the combustion chamber." },
  { id: 4, question: "Which component has the smallest cross-sectional area in the basic converging-diverging rocket nozzle?", options: ["Throat", "Exit", "Combustion chamber", "Injector"], correctIndex: 0, explanation: "The throat is the minimum-area section of a converging-diverging nozzle." },
  { id: 5, question: "Which statement about a rocket nozzle is correct?", options: ["It converts chemical energy directly into electrical energy", "It converts the energy of hot gases into high-velocity exhaust", "It stores the fuel before combustion", "It supplies oxygen to the combustion chamber"], correctIndex: 1, explanation: "The nozzle converts the available energy of the hot combustion gases into high-velocity exhaust, producing thrust." },
  { id: 6, question: "A higher specific impulse necessarily means that an engine produces higher thrust.", options: ["True", "False"], correctIndex: 1, explanation: "Specific impulse measures propellant efficiency; it does not by itself determine total thrust." },
  { id: 7, question: "Which propulsion type typically combines a solid fuel with a liquid or gaseous oxidizer?", options: ["Hybrid propulsion", "Liquid propulsion", "Solar sail propulsion", "Solid propulsion"], correctIndex: 0, explanation: "Hybrid propulsion typically uses a solid fuel with a liquid or gaseous oxidizer." },
  { id: 8, question: "In nuclear thermal propulsion, what is primarily used to heat the propellant?", options: ["Solar panels", "A chemical combustion chamber", "A nuclear reactor", "An electric motor"], correctIndex: 2, explanation: "A nuclear reactor supplies the thermal energy used to heat the propellant in a nuclear thermal rocket." },
  { id: 9, question: "Which propulsion system is generally characterized by very high exhaust velocity but very low thrust?", options: ["Solid rocket motor", "Liquid rocket engine", "Electric propulsion", "Hybrid rocket motor"], correctIndex: 2, explanation: "Electric propulsion systems can achieve very high exhaust velocities, but typically produce very low thrust." },
  { id: 10, question: "During rocket operation, the propellant is continuously consumed. What happens to the rocket's mass as the burn continues?", options: ["It continuously increases", "It continuously decreases", "It remains constant", "It first increases and then decreases"], correctIndex: 1, explanation: "As propellant is consumed and expelled, the total mass of the rocket continuously decreases." },
];

export const ROUND_DEFINITIONS: Record<RoundKey, RoundDefinition> = {
  throwback: {
    key: "throwback",
    name: "THROWBACK",
    subtitle: "Aviation & space history",
    themeClass: "round-throwback",
    durationSeconds: 30,
    questions: [],
  },
  ascension: {
    key: "ascension",
    name: "ASCENSION",
    subtitle: "Principles of fixed-wing flight",
    themeClass: "round-ascension",
    durationSeconds: QUIZ_DURATION_SECONDS,
    questions: ASCENSION_QUESTIONS,
  },
  ignition: {
    key: "ignition",
    name: "IGNITION",
    subtitle: "Aircraft & rocket propulsion",
    themeClass: "round-ignition",
    durationSeconds: QUIZ_DURATION_SECONDS,
    questions: IGNITION_QUESTIONS,
  },
};

export const STAGES: RoundKey[] = ["throwback", "ascension", "ignition"];

export function stageForGlobalQuestion(round: number): RoundKey {
  if (round < 10) return "throwback";
  if (round < 20) return "ascension";
  return "ignition";
}

export function questionIndexForRound(round: number) {
  return round % QUESTIONS_PER_ROUND;
}

export function globalRound(stage: RoundKey, questionIndex: number) {
  const base = stage === "throwback" ? 0 : stage === "ascension" ? 10 : 20;
  return base + questionIndex;
}
