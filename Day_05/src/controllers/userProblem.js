const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility');
const Problem = require("../models/problem");

const createProblem = async(req,res) => {
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator} = req.body;

    try {

        for (const {language,completeCode} of referenceSolution) {
            const languageId = getLanguageById(language);

            // creating a batch submission
            const submission = visibleTestCases.map((testcase)=>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submission);
            console.log(submitResult);
            

            const resultToken = submitResult.map((value)=>value.token); // ["token1","token2","token3"]
            const testResult = await submitToken(resultToken);
            console.log(testResult);
            
            for (const test of testResult) {
                if(test.status_id != 3)
                    return res.status(400).send("Error Occurred!");
            }
        }

        // now we can store it in db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });
        
        res.status(201).send("Problem Saved Successfully");

    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

module.exports = {createProblem};