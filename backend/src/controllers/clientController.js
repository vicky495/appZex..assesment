const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");

const createClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Client must belong to the logged-in agency
    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with an agency",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name,
          email,
          agencyId: req.user.agencyId,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CLIENT",
          agencyId: req.user.agencyId,
          clientId: client.id,
        },
      });

      return { client, user };
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      client: {
        id: result.client.id,
        name: result.client.name,
        email: result.client.email,
        agencyId: result.client.agencyId,
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        agencyId: result.user.agencyId,
        clientId: result.user.clientId,
      },
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create client",
    });
  }
};


// GET CLIENTS FOR LOGGED-IN AGENCY
const getClients = async (req, res) => {
  try {
    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with an agency",
      });
    }

    const clients = await prisma.client.findMany({
      where: {
        agencyId: req.user.agencyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};


module.exports = {
  createClient,
  getClients,
};