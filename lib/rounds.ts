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
  { id: 1, question: "For a conventional fixed-wing aircraft in steady level flight, lift primarily balances which force?", options: ["Thrust", "Weight", "Drag", "Centripetal force"], correctIndex: 1, explanation: "In steady level flight, lift balances the aircraft's weight." },
  { id: 2, question: "What happens to the angle of attack when an aircraft's nose is pitched up while its flight path initially remains unchanged?", options: ["It decreases", "It increases", "It becomes zero", "It is unaffected"], correctIndex: 1, explanation: "A pitch-up changes the wing's attitude relative to the incoming airflow, increasing angle of attack initially." },
  { id: 3, question: "Which wing feature primarily generates a pressure difference that contributes to lift?", options: ["The wing's airfoil shape", "The landing gear", "The windshield", "The vertical stabilizer only"], correctIndex: 0, explanation: "The airfoil geometry and its angle to the airflow create the pressure and momentum changes associated with lift." },
  { id: 4, question: "A stall occurs when a wing exceeds its critical angle of attack. What is the main aerodynamic result?", options: ["Lift increases indefinitely", "The airflow separates significantly from the wing", "Drag becomes zero", "Thrust automatically increases"], correctIndex: 1, explanation: "Beyond the critical angle of attack, flow separation increases and lift drops sharply." },
  { id: 5, question: "Why does induced drag generally decrease as an aircraft flies faster at a given weight and configuration?", options: ["The aircraft becomes lighter", "The required lift coefficient decreases", "Air density becomes zero", "Parasite drag disappears"], correctIndex: 1, explanation: "At higher speed, less lift coefficient is needed to produce the same lift, reducing the induced-drag component." },
  { id: 6, question: "What is the main purpose of an aircraft's horizontal stabilizer?", options: ["Provide longitudinal stability and control", "Generate all the thrust", "Replace the main wings", "Pressurize the cabin"], correctIndex: 0, explanation: "The horizontal tail provides pitch stability and control, usually through the elevator or stabilator." },
  { id: 7, question: "Which control surface primarily controls roll?", options: ["Rudder", "Elevator", "Ailerons", "Speed brakes"], correctIndex: 2, explanation: "Ailerons change lift between the left and right wings to produce a rolling moment." },
  { id: 8, question: "Why are winglets used on many aircraft?", options: ["To increase induced drag", "To reduce wingtip-vortex effects and induced drag", "To cool the engines", "To replace flaps"], correctIndex: 1, explanation: "Winglets weaken the effective wingtip-vortex system and can reduce induced drag in cruise." },
  { id: 9, question: "For a subsonic aircraft, increasing airspeed while holding altitude and weight approximately constant generally requires the wing to produce a lower lift coefficient. Why?", options: ["Dynamic pressure is higher", "Gravity is weaker", "The wing disappears", "Air becomes incompressible"], correctIndex: 0, explanation: "Lift is proportional to dynamic pressure times lift coefficient, so higher dynamic pressure means less CL is needed for the same lift." },
  { id: 10, question: "What does Mach number compare?", options: ["Aircraft weight to thrust", "Aircraft speed to the local speed of sound", "Lift to drag", "Pressure to density"], correctIndex: 1, explanation: "Mach number is the ratio of an object's speed to the local speed of sound." },
];

export const IGNITION_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: "Which engine cycle is most commonly associated with modern turbofan aircraft engines?", options: ["Brayton cycle", "Otto cycle", "Rankine cycle", "Stirling cycle"], correctIndex: 0, explanation: "Gas-turbine aircraft engines operate on the Brayton/Joule cycle." },
  { id: 2, question: "In a turbofan, what does the fan primarily do?", options: ["Produce only electrical power", "Accelerate a large mass of air to produce thrust", "Cool the landing gear", "Replace the compressor completely"], correctIndex: 1, explanation: "The fan accelerates a large mass of air; in high-bypass turbofans most thrust comes from the bypass stream." },
  { id: 3, question: "Which component raises the pressure of air before combustion in a gas-turbine engine?", options: ["Turbine", "Compressor", "Nozzle", "Afterburner"], correctIndex: 1, explanation: "The compressor increases the pressure of incoming air before it enters the combustor." },
  { id: 4, question: "What is the primary purpose of the turbine in a turbojet or turbofan core?", options: ["Extract energy from hot gas to drive the compressor and accessories", "Store fuel", "Generate lift", "Reduce the aircraft's weight"], correctIndex: 0, explanation: "The turbine extracts energy from the combustion products to drive the compressor and other engine systems." },
  { id: 5, question: "A rocket differs fundamentally from an air-breathing jet because a rocket", options: ["cannot produce thrust in space", "carries both fuel and oxidizer", "does not use combustion", "must have wings"], correctIndex: 1, explanation: "A rocket carries its oxidizer, allowing it to operate without atmospheric oxygen." },
  { id: 6, question: "In a chemical rocket, the nozzle primarily converts high-pressure thermal energy into", options: ["shaft power", "high-speed exhaust flow", "electrical energy", "wing lift"], correctIndex: 1, explanation: "The converging-diverging nozzle accelerates the hot gas to produce a high-velocity exhaust jet." },
  { id: 7, question: "What does specific impulse (Isp) measure for a rocket engine?", options: ["Fuel tank volume only", "Propellant efficiency in producing thrust", "Rocket diameter", "Combustion chamber temperature only"], correctIndex: 1, explanation: "Specific impulse is a measure of how effectively a rocket engine uses propellant to generate thrust." },
  { id: 8, question: "Why do liquid rocket engines often use turbopumps?", options: ["To lower propellant pressure", "To raise propellant pressure for injection into the combustion chamber", "To create aerodynamic lift", "To remove all heat from the exhaust"], correctIndex: 1, explanation: "Turbopumps raise propellant pressure so the propellants can be delivered into the chamber at the required pressure." },
  { id: 9, question: "What is an afterburner used for in a turbojet or low-bypass turbofan?", options: ["Increase thrust by burning additional fuel in the exhaust", "Reduce compressor pressure", "Power the landing lights", "Stop combustion"], correctIndex: 0, explanation: "An afterburner injects and burns additional fuel downstream of the turbine to increase exhaust energy and thrust." },
  { id: 10, question: "For a rocket in vacuum, which statement is most accurate about the importance of exhaust velocity?", options: ["Higher effective exhaust velocity generally increases achievable delta-v", "It has no relationship to performance", "Lower exhaust velocity always gives more delta-v", "Only rocket mass matters"], correctIndex: 0, explanation: "The rocket equation shows that achievable delta-v increases with effective exhaust velocity for a given mass ratio." },
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
