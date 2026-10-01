const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");

const createAgency = async (req, res) => {
  try {
    const {
      agencyName,
      slug,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (
      !agencyName ||
      !slug ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingAgency = await prisma.agency.findUnique({
      where: { slug },
    });

    if (existingAgency) {
      return res.status(409).json({
        success: false,
        message: "Agency slug already exists",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Admin email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          slug,
          isActive: true,
        },
      });

      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "AGENCY_ADMIN",
          agencyId: agency.id,
        },
      });

      return { agency, admin };
    });

    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      agency: {
        id: result.agency.id,
        name: result.agency.name,
        slug: result.agency.slug,
        isActive: result.agency.isActive,
      },
      admin: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role,
        agencyId: result.admin.agencyId,
      },
    });
  } catch (error) {
    console.error("Create agency error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create agency",
    });
  }
};


// GET ALL AGENCIES
// GET ALL AGENCIES
const getAgencies = async (req, res) => {
  try {
    const agencies = await prisma.agency.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      agencies,
    });
  } catch (error) {
    console.error("Get agencies error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch agencies",
    });
  }
};


// ACTIVATE / SUSPEND AGENCY
const updateAgencyStatus = async (req, res) => {
  try {
    const agencyId = Number(req.params.id);
    const { isActive } = req.body;

    if (!Number.isInteger(agencyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agency ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const agency = await prisma.agency.update({
      where: {
        id: agencyId,
      },
      data: {
        isActive,
      },
    });

    res.json({
      success: true,
      message: isActive
        ? "Agency activated successfully"
        : "Agency suspended successfully",
      agency,
    });
  } catch (error) {
    console.error("Update agency status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update agency status",
    });
  }
};


module.exports = {
  createAgency,
  getAgencies,
  updateAgencyStatus,
};