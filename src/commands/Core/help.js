import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from "../../utils/embeds.js";
import {
    createSelectMenu,
} from "../../utils/components.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_SELECT_ID = "help-category-select";
const ALL_COMMANDS_ID = "help-all-commands";
const BUG_REPORT_BUTTON_ID = "help-bug-report";
const HELP_MENU_TIMEOUT_MS = 5 * 60 * 1000;

const CATEGORY_ICONS = {
    Core: "ℹ️",
    Moderation: "🛡️",
    Economy: "💰",
    Fun: "🎮",
    Leveling: "📊",
    Utility: "🔧",
    Ticket: "🎫",
    Welcome: "👋",
    Giveaway: "🎉",
    Counter: "🔢",
    Tools: "🛠️",
    Search: "🔍",
    Reaction_Roles: "🎭",
    Community: "👥",
    Birthday: "🎂",
    Config: "⚙️",
};





async function createInitialHelpMenu(client) {
    const commandsPath = path.join(__dirname, "../../commands");
    const categoryDirs = (
        await fs.readdir(commandsPath, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();

    const options = [
        {
            label: "📋 All Commands",
            description: "View all available commands with pagination",
            value: ALL_COMMANDS_ID,
        },
        ...categoryDirs.map((category) => {
            const categoryName =
                category.charAt(0).toUpperCase() +
                category.slice(1).toLowerCase();
            const icon = CATEGORY_ICONS[categoryName] || "🔍";
            return {
                label: `${icon} ${categoryName}`,
                description: `View commands in the ${categoryName} category`,
                value: category,
            };
        }),
    ];

    const botName = client?.user?.username || "Bot";
    const embed = createEmbed({ 
        title: `🤖 ${botName} Centre d’aide`,
        description: "Votre compagnon Discord tout-en-un pour la modération, l’économie, le divertissement et la gestion du serveur.",
        color: 'primary'
    });

    embed.addFields(
        {
            name: "🛡️ **Modération**",
            value: "Modération du serveur, gestion des utilisateurs et outils d’application des règles",
            inline: true
        },
        {
            name: "💰 **Économie**",
            value: "Système de monnaie, boutiques et économie virtuelle",
            inline: true
        },
        {
            name: "🎮 **Divertissement**",
            value: "Jeux, divertissement et commandes interactives",
            inline: true
        },
        {
            name: "📊 **Niveaux**",
            value: "Niveaux des utilisateurs, système d’XP et suivi de progression",
            inline: true
        },
        {
            name: "🎫 **Tickets**",
            value: "Système de tickets de support pour la gestion du serveur",
            inline: true
        },
        {
            name: "🎉 **Concours**",
            value: "Gestion automatisée des concours et distribution des gains",
            inline: true
        },
        {
            name: "👋 **Bienvenue**",
            value: "Messages de bienvenue et intégration des nouveaux membres",
            inline: true
        },
        {
            name: "🎂 **Anniversaires**",
            value: "Suivi des anniversaires et fonctionnalités de célébration",
            inline: true
        },
        {
            name: "👥 **Communauté**",
            value: "Outils communautaires, candidatures et engagement des membres",
            inline: true
        },
        {
            name: "⚙️ **Configuration**",
            value: "Commandes de configuration du serveur et du bot",
            inline: true
        },
        {
            name: "🔢 **Compteur**",
            value: "Configuration de salon compteur en temps réel et contrôles associés",
            inline: true
        },
        {
            name: "🎙️ **Créer en rejoignant**",
            value: "Création et gestion dynamiques de salons vocaux",
            inline: true
        },
        {
            name: "🎭 **Rôles par réaction**",
            value: "Rôles auto-attribuables via des systèmes de réactions",
            inline: true
        },
        {
            name: "✅ **Vérification**",
            value: "Systèmes de vérification des membres et contrôle d’accès",
            inline: true
        },
        {
            name: "🔧 **Utilitaires**",
            value: "Outils utiles et utilitaires pour le serveur",
            inline: true
        }
    );

    embed.setFooter({ 
        text: "Les cacaouhètes c'est super !" 
    });
    embed.setTimestamp();

    const bugReportButton = new ButtonBuilder()
        .setCustomId(BUG_REPORT_BUTTON_ID)
        .setLabel("Report Bug")
        .setStyle(ButtonStyle.Danger);

    const supportButton = new ButtonBuilder()
        .setLabel("Support Server")
        .setURL("https://discord.gg/QnWNz2dKCE")
        .setStyle(ButtonStyle.Link);

    const touchpointButton = new ButtonBuilder()
        .setLabel("Learn from Touchpoint")
        .setURL("https://www.youtube.com/@TouchDisc")
        .setStyle(ButtonStyle.Link);

    const selectRow = createSelectMenu(
        CATEGORY_SELECT_ID,
        "Sélectionnez pour voir les commandes",
        options,
    );

    const buttonRow = new ActionRowBuilder().addComponents([
        bugReportButton,
        supportButton,
        touchpointButton,
    ]);

    return {
        embeds: [embed],
        components: [buttonRow, selectRow],
    };
}

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche le menu d’aide avec toutes les commandes disponibles"),

    async execute(interaction, guildConfig, client) {
        
        const { MessageFlags } = await import('discord.js');
        await InteractionHelper.safeDefer(interaction);
        
        const { embeds, components } = await createInitialHelpMenu(client);

        await InteractionHelper.safeEditReply(interaction, {
            embeds,
            components,
        });

        setTimeout(async () => {
            try {
                const closedEmbed = createEmbed({
                    title: "Menu d’aide fermé",
                    description: "Le menu d’aide a été fermé, utilisez /help à nouveau.",
                    color: "secondary",
                });

                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [closedEmbed],
                    components: [],
                });
            } catch (error) {
                
            }
        }, HELP_MENU_TIMEOUT_MS);
    },
};


