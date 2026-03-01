import Quiz from '../models/Quiz.js';

// @desc    Obtener todos los cuestionarios de un documento
// @route   GET /api/quizzes/:documentId
// @access  Privado
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json ({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un cuestionario por ID
// @route   GET /api/quizzes/quiz/:id
// @access  Privado
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!quiz) {
            return res.status(404).json ({
                success: false,
                error: 'Quiz no encontrado',
                statusCode: 404
            });
        }

        res.status(200).json ({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Enviar respuestas del cuestionario
// @route   POST /api/quizzes/:id/submit
// @access  Privado
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona un arreglo de respuestas',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz no encontrado',
                statusCode: 404
            });
        }

        if (quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'El quiz ya fue completado',
                statusCode: 400
            });
        }

        // Procesar respuestas
        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = selectedAnswer === question.correctAnswer;

                if (isCorrect) correctCount++;

                userAnswers.push ({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });
        
        // Calcular puntaje
        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        // Actualizar cuestionario
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers
            },
            message: 'Quiz enviado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener resultados del cuestionario
// @route   POST /api/quizzes/:id/results
// @access  Privado
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz no encontrado',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'El quiz aún no ha sido completado',
                statusCode: 400
            });
        }

        // Construir resultados detallados
        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);
            
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation
            };
        });

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt
                },
                results: detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar el cuestionario
// @route   DELETE /api/quizzes/:id
// @access  Privado
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz no encontrado',
                statusCode: 404
            });
        }

        await quiz.deleteOne();
;
        res.status(200).json ({
            success: true,
            message: 'Quiz eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};