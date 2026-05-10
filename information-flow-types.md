# Information Flow Control via Type Systems

## Executive Summary

Information flow control (IFC) uses type systems to enforce security properties at compile time — ensuring that sensitive data cannot leak to unauthorized observers. The field spans dependency types, linear types, session types, and security-level lattices. Recent work combines quantum and classical control flows, and uses functional architectures (Haskell DSLs) to enforce statistical rigor. Our FLUX ISA type safety and CFP protocol integrity goals align with this tradition.

## Our Connection

**FLUX ISA** has type safety requirements — the instruction set architecture must enforce that operations are well-typed. **CFP protocol** needs integrity guarantees — messages must flow correctly between agents without corruption or leakage. These are exactly the problems IFC type systems solve: ensuring information flows only along permitted paths.

## State of the Art

### Functional Architectures for Statistical Rigor (Nov 2025)
- **Sargsyan**: Uses a Haskell embedded DSL (the "Research monad") that makes it impossible to test a hypothesis without updating the error budget. Type system enforces statistical correctness.
- Key insight: type systems can enforce domain-specific properties (not just memory safety). The "type error" is "you're doing bad statistics." This is directly applicable — our type system could enforce "you're doing bad constraint satisfaction."

### Quantum-Classical Control (Nov 2025)
- **Dave et al.**: A programming language combining quantum and classical control. The type system tracks which variables are in superposition (quantum) and which are definite (classical), preventing information leaks between domains.
- Relevant because: our agents process information at different sensitivity levels. A type system that tracks "this variable came from an untrusted source" and prevents it from affecting trusted computations is exactly IFC.

### Session Types for Distributed Protocols
- Session types specify the communication protocol between distributed processes as a type. If your code type-checks, it follows the protocol. No runtime checks needed.
- Applied to: distributed financial protocols, multi-party computation, secure messaging
- Directly relevant: CFP protocol could be specified as session types, with type-checking ensuring protocol compliance

### Linear Types for Resource Management
- Linear types ensure each resource is used exactly once — no double-spending, no use-after-free, no resource leaks.
- Rust's ownership system is the most prominent practical application
- Applied to: cryptographic key management (each key used at most once), GPU memory management (each allocation freed exactly once)
- Relevant: our constraint engine's GPU memory management could benefit from linear type guarantees

### Dependency Types for Security
- Types that depend on values (not just other types). Example: `Array<n>` where n is a runtime value.
- Can express: "this function accepts only constraint sets with ≤N variables" — the type depends on the runtime value
- Coq and Agda have full dependent types; Rust and Haskell have limited forms
- Applied to: array bounds checking at compile time, protocol message size enforcement

## What We Should Adopt

1. **Session types for CFP**: Specify the CFP protocol as session types. If agents type-check against the session type, they're guaranteed to follow the protocol. Protocol violations become type errors.

2. **Linear types for GPU resources**: Use linear/affine types to manage GPU memory allocations. Prevent double-free, use-after-free, and resource leaks at compile time.

3. **Security levels as types**: Define a lattice of security levels (Public, Internal, Confidential, Secret). The type system ensures information only flows upward (from less to more secret), never downward.

4. **Dependent types for constraint bounds**: Express constraint bounds in types. "This solver accepts constraints with ≤1024 variables" becomes a type-level guarantee, checked at compile time.

## Concrete Experiment

**Phase 1**: Specify CFP as session types
- Write the CFP protocol as a session type specification
- Check: does our current implementation type-check? If not, what protocol violations exist?
- Fix any violations revealed by type-checking

**Phase 2**: Implement linear GPU resource management
- Wrap GPU allocations in a linear type system (or Rust's ownership model)
- Verify: no double-free, no leaked allocations, no use-after-free
- Benchmark: does the type system impose runtime overhead? (Should be zero — types are compile-time)

**Phase 3**: Security-level type system
- Define security lattice for fleet information: agent identities, constraint data, solution data, fleet configuration
- Implement type-level enforcement: sensitive data cannot appear in public outputs
- Verify: run the type checker on all agent code, fix any information leaks

## Tripartite Fit

**Constraint Theory**: Type checking IS constraint satisfaction — each type rule is a constraint, and type checking verifies that the program satisfies all type constraints. The type system is a constraint system, and the type checker is a solver.

**Formal Verification**: Type systems provide lightweight formal verification. "Well-typed programs don't go wrong" (Milner). For our security properties: "well-typed programs don't leak secrets." Stronger claim than testing, lighter weight than full Coq proofs.

**Production Systems**: Type errors are caught at compile time, not in production. Zero runtime overhead for security guarantees. The type system is a production safety net that never sleeps and has zero performance cost.

## Wild Speculation

What if the constraint engine's type system IS the security model? Every constraint carries a security level. The solver's type system ensures that solutions at security level L only contain information from inputs at level ≤L. The constraint satisfaction and the information flow control are the same type-checking pass. You can't express an insecure constraint — it's a type error.

Even wilder: dependent types that prove constraint properties. Not just "this is a constraint" but "this is a satisfiable constraint" (proven at type level). The type system distinguishes between potentially-UNSAT constraints and proven-SAT constraints. Compilation fails if you try to solve a constraint that might be UNSAT. The type system is so powerful it solves the halting problem... or at least the constraint satisfaction problem.
