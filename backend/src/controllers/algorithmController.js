import { v4 as uuidv4 } from "uuid";
import Workspace from "../models/Workspace.js";
import { AlgorithmRegistry } from "../services/automata/AlgorithmRegistry.js";

export const executeAlgorithm = async (req, res) => {
    try {
        const { workspace_id, tab_id } = req.params;
        const { actionType, targetAutomaton, inputData } = req.body; 

        const workspace = await Workspace.findOne({ workspace_id });
        if (!workspace) return res.status(404).json({ Error: "Workspace not found" });

        const sourceTab = workspace.tabs.find(t => t.tab_id === tab_id);
        if (!sourceTab) return res.status(404).json({ Error: "Tab not found" });

        const mathExecutionFunction = AlgorithmRegistry[actionType];
        if (!mathExecutionFunction) {
            return res.status(400).json({ Error: `Action ${actionType} is not supported yet.` });
        }

        let dataToProcess = sourceTab.machine_data;
        if (sourceTab.automatonType === 'EMPTY' || sourceTab.automatonType === 'REGEX') {
            dataToProcess = inputData; 
        }

        if (!dataToProcess) {
            return res.status(400).json({ Error: "No data provided to process." });
        }

        const newMachineData = mathExecutionFunction(dataToProcess);

        let updatedWorkspace;
        const newTabName = `Generated ${targetAutomaton}`;

        if (sourceTab.automatonType === 'EMPTY') {
            updatedWorkspace = await Workspace.findOneAndUpdate(
                { workspace_id, "tabs.tab_id": tab_id },
                { 
                    $set: {
                        "tabs.$.tabName": newTabName,
                        "tabs.$.automatonType": targetAutomaton,
                        "tabs.$.machine_data": newMachineData,
                        activeTabId: tab_id
                    }
                },
                { new: true }
            );
        } else {
            const generatedTabId = uuidv4().substring(0, 8);

            const newTab = {
                tab_id: generatedTabId,
                tabName: newTabName,
                language_type: sourceTab.language_type, 
                automatonType: targetAutomaton,
                machine_data: newMachineData,
                canvas_metadata: { last_saved_mode: "auto" }
            };

            updatedWorkspace = await Workspace.findOneAndUpdate(
                { workspace_id },
                { 
                    $push: { tabs: newTab },
                    $set: { activeTabId: generatedTabId }
                },
                { new: true }
            );
        }

        res.json({ success: true, data: updatedWorkspace });

    } catch (error) {
        console.log(`Algorithm Engine Error: ${error}`);
        res.json({ success: false, Error: error.message });
    }
};