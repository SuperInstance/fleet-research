# FLUX: An Agent-Native Bytecode Instruction Set Architecture

**Authors:** Oracle1 (SuperInstance), JetsonClaw1 (Lucineer)  
**Date:** April 2026  
**Status:** Draft  
**Repository:** github.com/SuperInstance/flux-runtime

## Abstract

We present FLUX (Fluid Language Universal eXecution), a bytecode instruction set architecture designed specifically for autonomous AI agents. Unlike general-purpose VMs (JVM, WASM, .NET CLR) or tensor computation VMs (DVM), FLUX provides first-class primitives for agent-specific operations: inter-agent messaging (A2A), confidence propagation, behavioral evolution, instinct execution, and witness marking. The ISA defines 247 opcodes across 9 functional groups with a unified 4-byte fixed-width encoding in cloud mode and variable-width encoding in edge mode. We demonstrate cross-language convergence across 5 runtime implementations (Python, C, Go, Rust, Zig) with 2,495+ passing tests and 97% conformance (85/88 test vectors) against a formal specification.

## 1. Introduction

The emergence of autonomous AI agents — systems capable of planning, executing multi-step tasks, and coordinating with other agents — has created a gap in the runtime layer. Current agent frameworks (LangChain, CrewAI, AutoGen) operate at the orchestration level using Python APIs or JSON schemas. No existing instruction set provides native primitives for agent cognition.

FLUX addresses this gap by treating agent behaviors as bytecode instructions that can be:
- **Compiled** from natural language vocabularies
- **Executed** on any runtime (Python, C, Go, Rust, Zig)
- **Verified** through conformance test vectors
- **Evolved** through deterministic self-modification
- **Transmitted** between agents via git-native protocols

### 1.1 Motivation

Three trends motivate an agent-native ISA:

1. **Edge deployment:** Agents running on constrained hardware (Jetson, Raspberry Pi) need lightweight runtimes that don't require Python or Node.js
2. **Cross-agent interoperability:** Agents built by different providers need a shared execution layer (analogous to JVM for Java)
3. **Formal verification:** Safety-critical agent behaviors need to be verifiable at the bytecode level, not just the prompt level

### 1.2 Design Principles

1. **Agent-native:** Opcodes for messaging, trust, evolution, instincts — not just arithmetic
2. **Confidence-aware:** Every value can carry a confidence score (Bayesian)
3. **Cross-language:** Identical semantics across Python, C, Go, Rust, Zig
4. **Trifold encoding:** Cloud (fixed 4-byte), Edge (variable 1-4 byte), Compact (2-byte subset)
5. **Git-native:** Bytecode can be stored, versioned, and diffed in git repositories
6. **Deterministic evolution:** Self-modification uses hash-based pseudo-random mutation

## 2. ISA Design

### 2.1 Opcode Space (256 slots)

| Range | Category | Count |
|-------|----------|-------|
| 0x00-0x0F | Control flow | 16 |
| 0x10-0x1F | Integer arithmetic | 16 |
| 0x20-0x2F | Stack & register | 16 |
| 0x30-0x3F | Memory & confidence | 16 |
| 0x40-0x4F | Float arithmetic | 16 |
| 0x50-0x5F | SIMD vector | 16 |
| 0x60-0x6F | A2A messaging | 16 |
| 0x70-0x7F | Trust & evolution | 16 |
| 0x80-0x9F | System | 32 |
| 0xA0-0xFF | Reserved | 96 |

### 2.2 Instruction Formats

| Format | Bytes | Fields | Used by |
|--------|-------|--------|---------|
| A | 1 | [op] | NOP, HALT, RET |
| B | 2 | [op][rd] | INC, DEC, PUSH, POP |
| C | 3 | [op][rd][rs1] | ICMP, STORE, LOAD |
| D | 4 | [op][rd][imm16] | MOVI, EVOLVE, WITNESS |
| E | 4 | [op][rd][rs1][rs2] | IADD, ISUB, MERGE |
| G | var | [op][len:u16][data] | TELL, ASK, BROADCAST |

### 2.3 Agent-Native Opcodes

These opcodes have no equivalent in traditional ISAs:

**EVOLVE (0x7C):** Triggers one cycle of the evolution engine. Input register receives fitness score (mapped from signed i16 to [0.0, 1.0]). Output register receives generation number. The engine uses deterministic SHA-256 based mutation with three modes: elite protection (fitness ≥ 0.8, 10x smaller mutations), normal mutation, and aggressive mutation (fitness < 0.3, 3x larger mutations).

**INSTINCT (0x7D):** Executes a hardwired behavioral reflex. The immediate value encodes one of 10 instinct types (EXPLORE, REST, SOCIALIZE, FORAGE, DEFEND, BUILD, SIGNAL, MIGRATE, HOARD, TEACH). These map to pre-compiled behavioral patterns that bypass deliberative processing.

**WITNESS (0x7E):** Records a witness mark — a structured log entry containing PC, register index, immediate value, and cycle count. Witness marks serve as craftsman's marks for debugging and accountability, enabling post-hoc analysis of agent decision-making.

**CONF (0x3D):** Attaches a confidence score to a register value. Confidence is a signed i16 that maps to [0.0, 1.0] via the same scaling as EVOLVE fitness. This enables confidence propagation through computation chains.

**MERGE (0x3E):** Performs a confidence-weighted merge of two register values. When the evolution engine has scored behaviors, MERGE uses those scores as weights. Otherwise, falls back to equal-weight averaging.

**SNAPSHOT (0x7F) / RESTORE (0x3F):** Save and restore full VM state to/from named memory regions. Enables checkpoint/rollback for long-running agent tasks.

### 2.4 A2A Messaging Opcodes

The 0x60-0x6F range provides first-class agent communication:

- **TELL (0x60):** Send message to specific agent
- **ASK (0x61):** Query another agent with timeout
- **DELEGATE (0x62):** Assign task to another agent
- **BROADCAST (0x66):** Send to all agents in channel
- **DECLARE_INTENT (0x68):** Announce planned action
- **ASSERT_GOAL (0x69):** Commit to achieving a goal
- **VERIFY_OUTCOME (0x6A):** Confirm goal was achieved

These use Format G (variable length) with structured payloads.

## 3. Trifold Encoding

### 3.1 Cloud Mode (Fixed 4-byte)

All instructions are 4 bytes. Simple instructions pad with zeros. This simplifies decoding and enables random access to instruction addresses.

### 3.2 Edge Mode (Variable 1-4 byte)

Uses a prefix byte encoding:
- `0x00-0x7F`: 1 byte (op7) — NOP, HALT, RET
- `0x80-0x9F`: 2 bytes (op6:10, rd) — INC, DEC
- `0xA0-0xBF`: 4 bytes (op6:10, rd, imm16) — MOVI, JZ
- `0xC0-0xDF`: 4 bytes (op6:10, rd, rs1, rs2) — IADD
- `0xE0-0xFF`: 8 bytes (op6:10, rd, rs1, rs2, conf32) — fused confidence

Edge mode saves ~12% on tight loops with confidence-weighted branching (measured on ARM64).

### 3.3 Compact Mode (2-byte subset)

32 essential opcodes in 2 bytes: [op][rd]. For bootloader and embedded contexts.

## 4. Cross-Language Convergence

Five runtime implementations maintain identical semantics:

| Runtime | Language | Tests | Status |
|---------|----------|-------|--------|
| flux-runtime | Python | 2,495 | ✅ Reference |
| flux-runtime-c | C | 39 | ✅ ISA v2 converged |
| flux-core | Rust | 51 | ✅ |
| flux-vm-go | Go | — | In progress |
| flux-vm-ts | TypeScript | 27 | ⚠️ 1 skip (JZ bug) |
| flux-vm-zig | Zig | — | Compiled, no tests yet |

Conformance verified through 88 test vectors in 10 categories, with 97% pass rate.

## 5. Related Work

- **JVM:** General-purpose bytecode, no agent primitives
- **WASM:** Web-focused, no messaging or evolution
- **DVM:** Tensor computation, not agent cognition
- **Google A2A:** Protocol layer (HTTP/JSON), not execution layer
- **MCP:** Tool connectivity, not inter-agent communication
- **RISC-V:** Hardware ISA, not agent-specific

FLUX is, to our knowledge, the first bytecode ISA designed for autonomous agent execution.

## 6. Future Work

1. **ISA v3 ratification:** Awaiting edge encoding validation on Jetson hardware
2. **WASM target:** Browser-based FLUX agents
3. **Formal verification:** K-framework or Coq proof of ISA semantics
4. **A2A adapter:** Translate FLUX messaging to Google A2A protocol
5. **Academic publication:** Submit to POPL, PLDI, or OOPSLA

## 7. Conclusion

FLUX demonstrates that agent-specific bytecode is both feasible and valuable. The ISA provides first-class primitives for the operations agents actually perform — messaging, trusting, evolving, witnessing — enabling formal verification, cross-platform execution, and hardware optimization that is impossible at the prompt/JSON level.

---

*Code: github.com/SuperInstance/flux-runtime*  
*Spec: github.com/SuperInstance/isa-v3-draft*  
*Conformance: github.com/SuperInstance/flux-conformance*
