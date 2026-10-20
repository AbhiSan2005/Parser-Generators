const pairKey = (left, right) => JSON.stringify([left, right].sort());

export const minimize_dfa_myhill_nerode = (dfaData) => {
    const alphabet = (dfaData.alphabet || []).map(String);
    const states = (dfaData.states || []).map(String);
    const initialState = String((dfaData.initial_states || [])[0] ?? '');
    const finalStates = new Set((dfaData.final_states || []).map(String));
    const adjacencyList = dfaData.adjacency_list || {};

    if (!states.includes(initialState)) {
        throw new Error('Myhill-Nerode minimization requires a valid initial state.');
    }

    let sinkState = '__sink__';
    while (states.includes(sinkState)) sinkState += '_';

    const transitionsByState = new Map();
    const reachable = new Set([initialState]);
    const queue = [initialState];
    let needsSink = false;

    while (queue.length > 0) {
        const state = queue.shift();
        const stateTransitions = new Map();
        transitionsByState.set(state, stateTransitions);

        for (const symbol of alphabet) {
            const rawTargets = adjacencyList[state]?.[symbol];
            const target = Array.isArray(rawTargets) ? rawTargets[0] : rawTargets;
            const destination = target === undefined || target === null || target === ''
                ? (needsSink = true, sinkState)
                : String(target);
            stateTransitions.set(symbol, destination);
            if (destination !== sinkState && !reachable.has(destination)) {
                reachable.add(destination);
                queue.push(destination);
            }
        }
    }

    const reachableStates = states.filter(state => reachable.has(state));
    if (needsSink) {
        reachableStates.push(sinkState);
        transitionsByState.set(sinkState, new Map(alphabet.map(symbol => [symbol, sinkState])));
    }

    const entries = new Map();
    const initialMarks = [];
    for (let leftIndex = 0; leftIndex < reachableStates.length; leftIndex++) {
        for (let rightIndex = leftIndex + 1; rightIndex < reachableStates.length; rightIndex++) {
            const left = reachableStates[leftIndex];
            const right = reachableStates[rightIndex];
            if (finalStates.has(left) !== finalStates.has(right)) {
                const entry = {
                    left,
                    right,
                    distinguishable: true,
                    witness: 'ε',
                    reason: 'One state is accepting and the other is not.',
                    round: 0
                };
                entries.set(pairKey(left, right), entry);
                initialMarks.push(entry);
            }
        }
    }

    const rounds = [{ round: 0, marked_pairs: initialMarks }];
    let roundNumber = 1;

    while (true) {
        const additions = [];
        for (let leftIndex = 0; leftIndex < reachableStates.length; leftIndex++) {
            for (let rightIndex = leftIndex + 1; rightIndex < reachableStates.length; rightIndex++) {
                const left = reachableStates[leftIndex];
                const right = reachableStates[rightIndex];
                if (entries.has(pairKey(left, right))) continue;

                for (const symbol of alphabet) {
                    const leftTarget = transitionsByState.get(left)?.get(symbol);
                    const rightTarget = transitionsByState.get(right)?.get(symbol);
                    if (leftTarget === undefined || rightTarget === undefined || leftTarget === rightTarget) continue;
                    const targetEntry = entries.get(pairKey(leftTarget, rightTarget));
                    if (!targetEntry) continue;

                    additions.push({
                        left,
                        right,
                        distinguishable: true,
                        witness: `${symbol}${targetEntry.witness === 'ε' ? '' : targetEntry.witness}`,
                        via: symbol,
                        destination_pair: [leftTarget, rightTarget],
                        reason: `On '${symbol}', the destination states are distinguishable.`,
                        round: roundNumber
                    });
                    break;
                }
            }
        }

        if (additions.length === 0) break;
        additions.forEach(entry => entries.set(pairKey(entry.left, entry.right), entry));
        rounds.push({ round: roundNumber, marked_pairs: additions });
        roundNumber++;
    }

    const equivalentGroups = [];
    for (const state of reachableStates) {
        const compatibleGroup = equivalentGroups.find(group =>
            group.every(member => !entries.has(pairKey(state, member)))
        );
        if (compatibleGroup) compatibleGroup.push(state);
        else equivalentGroups.push([state]);
    }

    const minimizedStates = equivalentGroups.map((_, index) => `m${index}`);
    const stateMapping = {};
    const minimizedAdjacency = {};
    const minimizedTransitions = [];
    const minimizedFinalStates = [];
    let minimizedInitialState;

    equivalentGroups.forEach((group, index) => {
        const minimizedState = minimizedStates[index];
        const representative = group[0];
        stateMapping[minimizedState] = group;
        minimizedAdjacency[minimizedState] = {};
        if (group.includes(initialState)) minimizedInitialState = minimizedState;
        if (group.some(state => finalStates.has(state))) minimizedFinalStates.push(minimizedState);

        for (const symbol of alphabet) {
            const target = transitionsByState.get(representative)?.get(symbol);
            const targetIndex = equivalentGroups.findIndex(candidate => candidate.includes(target));
            if (targetIndex < 0) continue;
            const minimizedTarget = minimizedStates[targetIndex];
            minimizedAdjacency[minimizedState][symbol] = [minimizedTarget];
            minimizedTransitions.push({ from: minimizedState, to: minimizedTarget, symbol });
        }
    });

    const table = reachableStates.map((state, rowIndex) => reachableStates.map((other, columnIndex) => {
        if (rowIndex <= columnIndex) return null;
        return entries.get(pairKey(state, other)) || { distinguishable: false, witness: null, round: null };
    }));

    return {
        alphabet,
        states: minimizedStates,
        initial_states: minimizedInitialState ? [minimizedInitialState] : [],
        final_states: minimizedFinalStates,
        transitions: minimizedTransitions,
        adjacency_list: minimizedAdjacency,
        state_mapping: stateMapping,
        minimization_algorithm: 'MYHILL_NERODE',
        minimization_table: {
            states: reachableStates,
            cells: table,
            rounds,
            equivalent_pairs: reachableStates.flatMap((left, leftIndex) =>
                reachableStates.slice(leftIndex + 1).filter(right => !entries.has(pairKey(left, right))).map(right => [left, right])
            )
        }
    };
};