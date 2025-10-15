import argon from "argon2";
import { RoleType,Branch } from "../generated/prisma";
import { prisma } from "../src/db/index.js";

async function main(){
    const roles = [RoleType.ADMIN, RoleType.STUDENT, RoleType.SUPERADMIN];
    for(const role of roles){
        await prisma.role.upsert({
            where:{name :role},
            update:{},
            create:{name : role},
        });
        console.log("roles updated")
    }
    const superAdminPassword = "SuperAdmin@123";
    const superAdminEmail = "24bcs108@nith.ac.in";
    const superAdminPass = await argon.hash(superAdminPassword);
    try {
        const superAdmin = await prisma.user.upsert({
            where:{email: superAdminEmail},
            update:{},
            create:{
                email: superAdminEmail,
                firstName : "Sitanshu",
                lastName : "Nayan",
                password : superAdminPass,
                emailVerified : true,
                role : {connect : {name : RoleType.SUPERADMIN} },
                branch : Branch.CS,
            }
        });
        const admin = await prisma.user.upsert({
            where:{email: "test@gmail.com"},
            update:{},
            create:{
                email : "test@gmail.com",
                firstName : "Test",
                lastName : "User",
                password : await argon.hash("Test@1234"),
                emailVerified : true,
                role : {connect : {name : RoleType.ADMIN} },
                branch : Branch.ME,
            }
        })
        console.log({superAdmin})
        console.log(admin);
    } catch (error) {
        console.log(error);
    }

}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});