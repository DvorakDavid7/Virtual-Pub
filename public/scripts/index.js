const buttons = document.querySelectorAll(".entry-buttons")
const origin = location.origin;


for (let button of buttons) {
    button.addEventListener("click", async (event) => {
        const buttonID = event.target.id;
        switch (buttonID) {
            case "room1":
                const userInput = prompt("Enter password: ")
                const passIsValid = await checkPassword(userInput)
                passIsValid ? location.href = `${origin}/brothel` : alert("Invalid password")
                break;

            case "room2":
                location.href = `${origin}/city_pub`
                break;

            default:
                break;
        }
    })
}


/**
 * Send request to server and verify the password
 * @param {string} password
 * @returns {Promise<Boolean>} true / false
 */
async function checkPassword(password) {
    const data = {
        password
    }
    try {
        const response = await fetch("/user/check_password", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        })
        return await response.json()

    } catch (error) {
        console.log(error);
    }
}
























