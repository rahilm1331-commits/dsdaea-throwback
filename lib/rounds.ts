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
  { id: 1, question: "Which engine cycle is most commonly associated with modern turbofan aircraft engines?", options: ["Otto cycle", "Brayton cycle", "Rankine cycle", "Diesel cycle"], correctIndex: 1, explanation: "Modern gas-turbine aircraft engines operate on the Brayton, or Joule, cycle." },
  { id: 2, question: "In a turbofan, what does the fan primarily do?", options: ["Compresses core air", "Drives the turbine shaft", "Accelerates bypass airflow", "Injects fuel into the combustor"], correctIndex: 2, explanation: "The fan accelerates a large mass of air, with the bypass stream providing a major share of thrust in a high-bypass turbofan." },
  { id: 3, question: "Which component raises the pressure of air before combustion in a gas-turbine engine?", options: ["Turbine", "Nozzle", "Combustor", "Compressor"], correctIndex: 3, explanation: "The compressor raises the pressure of the incoming air before it enters the combustor." },
  { id: 4, question: "What is the primary purpose of the turbine in a turbojet or turbofan core?", options: ["Raises inlet air pressure", "Drives the core compressor", "Adds fuel after turbine", "Accelerates bypass air"], correctIndex: 1, explanation: "The turbine extracts energy from the hot gas stream to drive the compressor and other engine accessories." },
  { id: 5, question: "A rocket differs fundamentally from an air-breathing jet because a rocket", options: ["Uses atmospheric oxygen", "Needs an air inlet", "Depends on ambient oxygen", "Carries onboard oxidizer"], correctIndex: 3, explanation: "A rocket carries both fuel and oxidizer, so it does not depend on atmospheric oxygen and can operate in vacuum." },
  { id: 6, question: "In a chemical rocket, the nozzle primarily converts high-pressure thermal energy into", options: ["Stored propellant pressure", "High-speed exhaust flow", "Shaft power for pumps", "Electrical power for avionics"], correctIndex: 1, explanation: "The rocket nozzle converts the gas's available pressure and thermal energy into high-velocity exhaust, producing thrust." },
  { id: 7, question: "What does specific impulse (Isp) measure for a rocket engine?", options: ["Thrust per unit propellant mass", "Heat per unit propellant mass", "Thrust per unit propellant weight flow", "Pressure per unit chamber volume"], correctIndex: 2, explanation: "Specific impulse relates thrust to propellant weight flow and is commonly used as a measure of rocket propellant efficiency." },
  { id: 8, question: "Why do liquid rocket engines often use turbopumps?", options: ["Raise propellant pressure for injection", "Lower chamber pressure during firing", "Cool the nozzle with exhaust gas", "Replace the combustion chamber entirely"], correctIndex: 0, explanation: "Turbopumps raise propellant pressure so the fuel and oxidizer can be injected into the combustion chamber at the required pressure." },
  { id: 9, question: "What is an afterburner used for in a turbojet or low-bypass turbofan?", options: ["Reduce turbine inlet pressure", "Cool the compressor during cruise", "Increase turbine blade cooling", "Increase thrust using extra fuel"], correctIndex: 3, explanation: "An afterburner burns additional fuel downstream of the turbine to increase exhaust energy and thrust." },
  { id: 10, question: "For a rocket in vacuum, which statement is most accurate about the importance of exhaust velocity?", options: ["It has no effect on delta-v", "Higher exhaust velocity raises achievable delta-v", "Lower exhaust velocity raises achievable delta-v", "Rocket mass alone sets achievable delta-v"], correctIndex: 1, explanation: "For a given mass ratio, higher effective exhaust velocity increases the delta-v predicted by the rocket equation." },
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
