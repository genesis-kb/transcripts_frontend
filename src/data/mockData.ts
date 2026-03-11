export interface Transcript {
  id: string;
  title: string;
  source: string;
  conference: string;
  speakers: string[];
  date: string;
  tags: string[];
  summary: string;
  body: string;
  type: 'conference' | 'podcast' | 'workshop' | 'meetup' | 'call';
  language: string;
  chapters?: { time: string; title: string }[];
}

export interface Category {
  name: string;
  slug: string;
  count: number;
  subcategories: { name: string; count: number }[];
}

export interface Speaker {
  name: string;
  slug: string;
  transcriptCount: number;
  topics: string[];
}

export interface Conference {
  name: string;
  slug: string;
  year: number;
  location: string;
  sessions: number;
  description: string;
}

export const transcripts: Transcript[] = [
  {
    id: "taproot-channels",
    title: "Simple Taproot Channels",
    source: "Chaincode Labs",
    conference: "Chaincode Podcast",
    speakers: ["Elle Mouton", "Oliver Gugger"],
    date: "2023-07-15",
    tags: ["Taproot", "PTLC", "Anchor outputs", "CPFP carve out", "Simple taproot channels"],
    summary: "Elle Mouton and Oliver Gugger explained the transition from 2-of-2 Pay-to-Witness-Script-Hash funding outputs to MuSig2 key funding outputs in Taproot channels.",
    body: `## Introduction\n\nIn this episode, Elle Mouton and Oliver Gugger discuss Simple Taproot Channels...\n\n### Key Points\n\n- Transition from P2WSH to MuSig2 key funding outputs\n- Privacy and chain space savings\n- The spec for Taproot channels, proposed by Roasbeef\n- Nearing completion with notable progress from LND and LDK implementations\n\n### Timestamps\n\n**[00:00]** Introduction and overview\n**[05:30]** Current state of Lightning channel types\n**[12:45]** What changes with Taproot channels\n**[25:00]** MuSig2 key aggregation explained\n**[38:15]** PTLC implications\n**[45:00]** Implementation progress in LND and LDK\n**[52:30]** Future outlook and remaining challenges`,
    type: "podcast",
    language: "en",
    chapters: [
      { time: "00:00", title: "Introduction and overview" },
      { time: "05:30", title: "Current state of Lightning channel types" },
      { time: "12:45", title: "What changes with Taproot channels" },
      { time: "25:00", title: "MuSig2 key aggregation explained" },
      { time: "38:15", title: "PTLC implications" },
      { time: "45:00", title: "Implementation progress" },
    ],
  },
  {
    id: "erlay-p2p",
    title: "Current State of P2P Research / Erlay",
    source: "London Bitcoin Devs",
    conference: "London Bitcoin Devs",
    speakers: ["Gleb Naumenko"],
    date: "2019-11-13",
    tags: ["P2P", "Erlay", "Bandwidth", "Network protocol"],
    summary: "Gleb Naumenko presents Erlay, a transaction relay protocol that reduces bandwidth usage by 40% while maintaining propagation speed.",
    body: `## Erlay: Efficient Transaction Relay\n\nGleb Naumenko discusses the current state of P2P research with focus on Erlay...\n\n### Abstract\n\nErlay is a transaction relay protocol for Bitcoin that uses a combination of flooding and set reconciliation to significantly reduce bandwidth...\n\n### Key Contributions\n\n1. Reduces bandwidth by ~40%\n2. Maintains transaction propagation speed\n3. Uses Minisketch for set reconciliation\n4. Enables more connections per node`,
    type: "meetup",
    language: "en",
    chapters: [
      { time: "00:00", title: "Introduction to P2P challenges" },
      { time: "10:00", title: "Erlay protocol design" },
      { time: "25:00", title: "Minisketch set reconciliation" },
      { time: "40:00", title: "Benchmark results" },
    ],
  },
  {
    id: "fraud-proofs",
    title: "Fraud Proofs and Modularized Validation",
    source: "MIT Bitcoin Expo",
    conference: "MIT Bitcoin Expo 2016",
    speakers: ["Peter Todd"],
    date: "2016-03-06",
    tags: ["Fraud proofs", "Validation", "Scalability", "SPV"],
    summary: "Peter Todd discusses fraud proofs and how modularized validation can improve Bitcoin's scalability while maintaining security.",
    body: `## Fraud Proofs and Modularized Validation\n\nPeter Todd explores the concept of fraud proofs...\n\n### Overview\n\nFraud proofs allow light clients to verify that blocks follow consensus rules without downloading the entire blockchain...`,
    type: "conference",
    language: "en",
  },
  {
    id: "debugging-bitcoin",
    title: "Debugging Bitcoin Core",
    source: "Bitcoin Edge Dev++",
    conference: "Bitcoin Edge Dev++ 2019",
    speakers: ["Fabian Jahr"],
    date: "2019-09-10",
    tags: ["Developer Tools", "Debugging", "Bitcoin Core", "GDB"],
    summary: "Fabian Jahr provides a comprehensive workshop on debugging Bitcoin Core using GDB, logging, and other developer tools.",
    body: `## Debugging Bitcoin Core Workshop\n\nFabian Jahr walks through practical debugging techniques...`,
    type: "workshop",
    language: "en",
  },
  {
    id: "mimblewimble",
    title: "Mimblewimble: Private, Massively-Prunable Blockchains",
    source: "Scaling Bitcoin Conference",
    conference: "Scaling Bitcoin Milan 2016",
    speakers: ["Andrew Poelstra"],
    date: "2016-10-08",
    tags: ["Privacy", "Mimblewimble", "Scalability", "Confidential Transactions"],
    summary: "Andrew Poelstra presents Mimblewimble, a blockchain design that achieves privacy through confidential transactions and enables massive pruning.",
    body: `## Mimblewimble\n\nAndrew Poelstra introduces Mimblewimble, a protocol that combines confidential transactions with a novel block structure...`,
    type: "conference",
    language: "en",
  },
  {
    id: "mempool-ancestors",
    title: "Mempool Ancestors and Descendants",
    source: "The Bitcoin Development Podcast",
    conference: "The Bitcoin Development Podcast",
    speakers: ["John Newbery", "Gloria Zhao"],
    date: "2022-04-20",
    tags: ["Mempool", "Transaction relay", "Fee management", "Package relay"],
    summary: "John Newbery and Gloria Zhao discuss mempool ancestor and descendant limits, CPFP, and the path to package relay.",
    body: `## Mempool Ancestors and Descendants\n\nA deep dive into how the mempool manages transaction dependencies...`,
    type: "podcast",
    language: "en",
  },
  {
    id: "lightning-pathfinding",
    title: "Lightning Payment Pathfinding for Reliability",
    source: "Lightning Conference",
    conference: "Lightning Conference 2019",
    speakers: ["Joost Jager"],
    date: "2019-10-20",
    tags: ["Lightning Network", "Pathfinding", "Routing", "Reliability"],
    summary: "Joost Jager discusses improving Lightning payment reliability through better pathfinding algorithms and mission control.",
    body: `## Lightning Payment Pathfinding\n\nJoost Jager presents improvements to Lightning payment routing...`,
    type: "conference",
    language: "en",
  },
  {
    id: "assumeutxo",
    title: "AssumeUTXO and Initial Block Download",
    source: "Bitcoin Core Dev",
    conference: "Bitcoin Core PR Review Club",
    speakers: ["James O'Beirne"],
    date: "2021-06-15",
    tags: ["AssumeUTXO", "IBD", "Consensus", "Performance"],
    summary: "James O'Beirne explains AssumeUTXO, a feature that allows nodes to start with a UTXO snapshot for faster initial sync.",
    body: `## AssumeUTXO\n\nAssumeUTXO enables Bitcoin nodes to begin operating almost immediately by loading a trusted UTXO set snapshot...`,
    type: "call",
    language: "en",
  },
];

export const categories: Category[] = [
  { name: "Backup and Recovery", slug: "backup-and-recovery", count: 8, subcategories: [{ name: "Codex32", count: 1 }, { name: "Watchtowers", count: 7 }] },
  { name: "Bandwidth Reduction", slug: "bandwidth-reduction", count: 7, subcategories: [{ name: "Compact Block Relay", count: 2 }, { name: "Erlay", count: 4 }] },
  { name: "Consensus Enforcement", slug: "consensus-enforcement", count: 50, subcategories: [{ name: "AssumeUTXO", count: 7 }, { name: "Soft Fork Activation", count: 30 }, { name: "Utreexo", count: 8 }] },
  { name: "Contract Protocols", slug: "contract-protocols", count: 101, subcategories: [{ name: "DLCs", count: 15 }, { name: "Multisig", count: 25 }, { name: "Vaults", count: 12 }] },
  { name: "Developer Tools", slug: "developer-tools", count: 47, subcategories: [{ name: "Debugging", count: 8 }, { name: "Testing", count: 15 }] },
  { name: "Fee Management", slug: "fee-management", count: 70, subcategories: [{ name: "CPFP", count: 12 }, { name: "RBF", count: 20 }] },
  { name: "Lightning Network", slug: "lightning-network", count: 229, subcategories: [{ name: "Channel Management", count: 45 }, { name: "Routing", count: 38 }, { name: "Taproot Channels", count: 12 }] },
  { name: "Mining", slug: "mining", count: 62, subcategories: [{ name: "Stratum V2", count: 8 }, { name: "Pool Mining", count: 15 }] },
  { name: "Privacy Enhancements", slug: "privacy-enhancements", count: 202, subcategories: [{ name: "CoinJoin", count: 30 }, { name: "Confidential Transactions", count: 18 }] },
  { name: "Scripts and Addresses", slug: "scripts-and-addresses", count: 229, subcategories: [{ name: "Tapscript", count: 20 }, { name: "OP_CAT", count: 8 }] },
  { name: "Security Enhancements", slug: "security-enhancements", count: 26, subcategories: [{ name: "Hardware Wallets", count: 10 }] },
  { name: "Soft Forks", slug: "soft-forks", count: 173, subcategories: [{ name: "SegWit", count: 40 }, { name: "Taproot", count: 55 }] },
  { name: "P2P Network Protocol", slug: "p2p-network-protocol", count: 72, subcategories: [{ name: "Addr Relay", count: 5 }, { name: "Eclipse Attacks", count: 8 }] },
  { name: "Transaction Relay Policy", slug: "transaction-relay-policy", count: 34, subcategories: [{ name: "Package Relay", count: 12 }] },
  { name: "Wallet Collaboration Tools", slug: "wallet-collaboration-tools", count: 50, subcategories: [{ name: "PSBT", count: 18 }] },
];

export const speakers: Speaker[] = [
  { name: "Andrew Poelstra", slug: "andrew-poelstra", transcriptCount: 24, topics: ["Privacy", "Mimblewimble", "Schnorr"] },
  { name: "Gloria Zhao", slug: "gloria-zhao", transcriptCount: 18, topics: ["Mempool", "Package relay", "Transaction relay"] },
  { name: "Pieter Wuille", slug: "pieter-wuille", transcriptCount: 32, topics: ["SegWit", "Taproot", "Miniscript"] },
  { name: "Peter Todd", slug: "peter-todd", transcriptCount: 15, topics: ["Fraud proofs", "OpenTimestamps"] },
  { name: "Fabian Jahr", slug: "fabian-jahr", transcriptCount: 12, topics: ["Debugging", "AssumeUTXO", "Bitcoin Core"] },
  { name: "Elle Mouton", slug: "elle-mouton", transcriptCount: 8, topics: ["Lightning", "Taproot channels"] },
  { name: "John Newbery", slug: "john-newbery", transcriptCount: 22, topics: ["P2P", "Bitcoin Core", "Review"] },
  { name: "Joost Jager", slug: "joost-jager", transcriptCount: 9, topics: ["Lightning", "Pathfinding", "Routing"] },
  { name: "James O'Beirne", slug: "james-obeirne", transcriptCount: 14, topics: ["AssumeUTXO", "Vaults", "OP_VAULT"] },
  { name: "Adam Gibson", slug: "adam-gibson", transcriptCount: 11, topics: ["CoinJoin", "JoinMarket", "Privacy"] },
];

export const conferences: Conference[] = [
  { name: "Scaling Bitcoin", slug: "scaling-bitcoin", year: 2024, location: "Various", sessions: 45, description: "Annual conference focused on Bitcoin scalability research and development." },
  { name: "Bitcoin Edge Dev++", slug: "bitcoin-edge", year: 2023, location: "Nashville", sessions: 38, description: "Developer education conference covering Bitcoin Core and Lightning development." },
  { name: "Advancing Bitcoin", slug: "advancing-bitcoin", year: 2023, location: "London", sessions: 28, description: "Technical conference exploring cutting-edge Bitcoin research." },
  { name: "MIT Bitcoin Expo", slug: "mit-bitcoin-expo", year: 2024, location: "Cambridge, MA", sessions: 22, description: "Student-organized conference at MIT covering Bitcoin technology and policy." },
  { name: "Lightning Conference", slug: "lightning-conference", year: 2023, location: "Berlin", sessions: 35, description: "The premier event dedicated to Lightning Network development." },
  { name: "TABConf", slug: "tabconf", year: 2023, location: "Atlanta", sessions: 42, description: "Technical Atlanta Bitcoin Conference with hands-on workshops." },
];

export const types = [
  { name: "Conference", count: 473, slug: "conference" },
  { name: "Podcast", count: 192, slug: "podcast" },
  { name: "Workshop", count: 270, slug: "workshop" },
];

export const streamFragments = [
  "...MuSig2 key aggregation enables 2-of-2 multisig that looks like a single-key spend on chain...",
  "...Erlay reduces transaction relay bandwidth by approximately 40% using set reconciliation...",
  "...AssumeUTXO allows a node to start validating new blocks almost immediately...",
  "...Taproot channels provide significant privacy improvements for Lightning users...",
  "...Package relay enables CPFP fee-bumping for pre-signed transactions...",
  "...Miniscript provides a structured way to write Bitcoin Scripts with analysis guarantees...",
  "...The gossip protocol needs updates to support Taproot channel announcements...",
  "...Stratum V2 gives individual miners more control over block template construction...",
  "...OP_CAT could enable covenants and other advanced spending conditions on Bitcoin...",
  "...Fraud proofs allow light clients to verify consensus rules without full validation...",
];
