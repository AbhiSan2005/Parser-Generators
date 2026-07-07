export const minimize_dfa = (dfaData) => {
    const { alphabet, states, initial_states, final_states, adjacency_list } = dfaData;

    // Remove Unreachable States
    const reachable = new Set();
    const queue = [...initial_states];
    
    if (initial_states.length > 0) {
        reachable.add(initial_states[0]);
    }

    while(queue.length > 0) {
        const curr = queue.shift();
        for(const sym of alphabet) {
            if(adjacency_list[curr] && adjacency_list[curr][sym]) {
                const target = adjacency_list[curr][sym][0];
                if(!reachable.has(target)) {
                    reachable.add(target);
                    queue.push(target);
                }
            }
        }
    }

    // Create Initial Partitions (P0)
    // one for final and one for non-final
    const finalSet = new Set(final_states.filter(s => reachable.has(s)));
    const nonFinalSet = new Set(states.filter(s => reachable.has(s) && !finalSet.has(s)));

    let partitions = [];
    if (nonFinalSet.size > 0) partitions.push([...nonFinalSet].sort());
    if (finalSet.size > 0) partitions.push([...finalSet].sort());

    const derivationSteps = [];
    derivationSteps.push({ step: 0, partitions: [...partitions] });

    // --- STEP 3: Hopcroft's Refinement Loop ---
    let changed = true;
    let stepCount = 1;

    while (changed) {
        changed = false;
        const newPartitions = [];

        for (const group of partitions) {
            if (group.length <= 1) {
                newPartitions.push(group);
                continue;
            }

            // Split group based on where transitions land in the current partitions
            const splitMap = {};

            for (const state of group) {
                let signature = "";
                for (const sym of alphabet) {
                    const target = (adjacency_list[state] && adjacency_list[state][sym]) ? adjacency_list[state][sym][0] : null;

                    // Find the index of the partition that contains the target state
                    let targetPartitionIdx = -1;
                    if (target) {
                        targetPartitionIdx = partitions.findIndex(p => p.includes(target));
                    }
                    // e.g., signature for transitions on 'a' and 'b': "a:1|b:0|"
                    signature += `${sym}:${targetPartitionIdx}|`;
                }

                if (!splitMap[signature]) splitMap[signature] = [];
                splitMap[signature].push(state);
            }

            const subgroups = Object.values(splitMap);
            if (subgroups.length > 1) {
                changed = true;
            }
            // Add the new separated subgroups to the next iteration
            newPartitions.push(...subgroups.map(sg => sg.sort()));
        }

        partitions = newPartitions;
        if (changed) {
            derivationSteps.push({ step: stepCount++, partitions: [...partitions] });
        }
    }

    // --- STEP 4: Construct the Minimized DFA ---
    const newStates = [];
    const newInitialStates = [];
    const newFinalStates = [];
    const newTransitions = [];
    const newAdjacencyList = {};
    const stateMapping = {};

    // Generate new names (m0, m1, m2...)
    partitions.forEach((group, idx) => {
        const newStateName = `m${idx}`;
        newStates.push(newStateName);
        stateMapping[newStateName] = group;
        newAdjacencyList[newStateName] = {};

        if (group.some(s => initial_states.includes(s))) {
            newInitialStates.push(newStateName);
        }
        if (group.some(s => final_states.includes(s))) {
            newFinalStates.push(newStateName);
        }
    });

    // Map transitions to the new state names using a representative from each group
    partitions.forEach((group, idx) => {
        const newStateName = `m${idx}`;
        const rep = group[0]; 

        for (const sym of alphabet) {
            const target = (adjacency_list[rep] && adjacency_list[rep][sym]) ? adjacency_list[rep][sym][0] : null;
            if (target) {
                const targetIdx = partitions.findIndex(p => p.includes(target));
                const targetNewName = `m${targetIdx}`;

                newTransitions.push({ from: newStateName, to: targetNewName, symbol: sym });
                if (!newAdjacencyList[newStateName][sym]) newAdjacencyList[newStateName][sym] = [];
                newAdjacencyList[newStateName][sym].push(targetNewName);
            }
        }
    });

    return {
        alphabet,
        states: newStates,
        initial_states: newInitialStates,
        final_states: newFinalStates,
        transitions: newTransitions,
        adjacency_list: newAdjacencyList,
        state_mapping: stateMapping,
        derivation_steps: derivationSteps
    };
};