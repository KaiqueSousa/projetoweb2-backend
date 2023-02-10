const express = require("express");
const router = express.Router();
const verify = require("../utils/verifyToken");

// Importa o controller
const userController = require("../controllers/userController");

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Cria um novo usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuário criado.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 */
router.post("/register", userController.userCreate);

router.post("/admin/register", userController.userAdminCreate);

/**
 * @swagger
 * /users/confirmation:
 *   get:
 *     summary: Confirma um novo usuário através do token enviado pelo E-mail.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Usuário confirmado com sucesso.
 *
 */
router.get("/confirmation", userController.userConfirmation);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Efetua o login de um usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 */
router.post("/login", userController.userLogin);

router.get("/", verify, userController.usersList);

router.patch('/:id', verify, userController.updateUser);

router.delete('/:id', verify, userController.deleteUser);

module.exports = router;
