// frontend/src/pages/user-dashboard/achievements-badges/AchievementCard.jsx
import React from "react";
import "./AchievementCard.css";

// --- Import all your badge images here ---
import ecoNewbieBadge from "../../../images/user-dashboard/badges/eco-newbie.png";
import ecoNewbieGreyBadge from "../../../images/user-dashboard/badges/eco-newbie_grey.png";

import greenWarriorBadge from "../../../images/user-dashboard/badges/green-warrior.png";
import greenWarriorGreyBadge from "../../../images/user-dashboard/badges/green-warrior_grey.png";

import ecoChampionBadge from "../../../images/user-dashboard/badges/eco-champion.png";
import ecoChampionGreyBadge from "../../../images/user-dashboard/badges/eco-champion_grey.png";

import recyclingRangerBadge from "../../../images/user-dashboard/badges/recycling-ranger.png";
import recyclingRangerGreyBadge from "../../../images/user-dashboard/badges/recycling-ranger_grey.png";

import directoryExplorerBadge from "../../../images/user-dashboard/badges/directory-explorer.png";
import directoryExplorerGreyBadge from "../../../images/user-dashboard/badges/directory-explorer_grey.png";

import firstStepBadge from "../../../images/user-dashboard/badges/first-step.png";
import firstStepGreyBadge from "../../../images/user-dashboard/badges/first-step_grey.png";

import plasticReductionistBadge from "../../../images/user-dashboard/badges/plastic-reductionist.png";
import plasticReductionistGreyBadge from "../../../images/user-dashboard/badges/plastic-reductionist_grey.png";

import communityBuilderBadge from "../../../images/user-dashboard/badges/community-builder.png";
import communityBuilderGreyBadge from "../../../images/user-dashboard/badges/community-builder_grey.png";

import calculatorMasterBadge from "../../../images/user-dashboard/badges/calculator-master.png";
import calculatorMasterGreyBadge from "../../../images/user-dashboard/badges/calculator-master_grey.png";

// --- Mapping from filename to image module ---
export const badgeImageMap = {
  "eco-newbie.png": ecoNewbieBadge,
  "eco-newbie_grey.png": ecoNewbieGreyBadge,
  "green-warrior.png": greenWarriorBadge,
  "green-warrior_grey.png": greenWarriorGreyBadge,
  "eco-champion.png": ecoChampionBadge,
  "eco-champion_grey.png": ecoChampionGreyBadge,
  "recycling-ranger.png": recyclingRangerBadge,
  "recycling-ranger_grey.png": recyclingRangerGreyBadge,
  "directory-explorer.png": directoryExplorerBadge,
  "directory-explorer_grey.png": directoryExplorerGreyBadge,
  "first-step.png": firstStepBadge,
  "first-step_grey.png": firstStepGreyBadge,
  "plastic-reductionist.png": plasticReductionistBadge,
  "plastic-reductionist_grey.png": plasticReductionistGreyBadge,
  "community-builder.png": communityBuilderBadge,
  "community-builder_grey.png": communityBuilderGreyBadge,
  "calculator-master.png": calculatorMasterBadge,
  "calculator-master_grey.png": calculatorMasterGreyBadge,
};

function AchievementCard({ achievement }) {
  const {
    name,
    description,
    badgeFilename,
    criteria,
    isEarned,
    earnedDate,
    currentProgress,
    totalNeeded,
    tier,
    bonusType,
  } = achievement;

  const earnedBadgeSrc = badgeFilename ? badgeImageMap[badgeFilename] : null;
  const greyBadgeFilename = badgeFilename
    ? badgeFilename.replace(".png", "_grey.png")
    : null;
  const greyBadgeSrc = greyBadgeFilename
    ? badgeImageMap[greyBadgeFilename]
    : null;

  const finalBadgeSrc = isEarned
    ? earnedBadgeSrc || "/images/badges/default.png"
    : greyBadgeSrc || "/images/badges/default_grey.png";

  const progressPercentage =
    totalNeeded > 0 && currentProgress !== undefined
      ? Math.min((currentProgress / totalNeeded) * 100, 100)
      : 0;

  return (
    <div className={`achievement-card ${isEarned ? "earned" : "unearned"}`}>
      <div className="achievement-card-badge">
        <img
          src={finalBadgeSrc}
          alt={`${name} ${isEarned ? "Earned" : "Not Earned"} Badge`}
          className={`achievement-badge-image ${!isEarned ? "grayscale" : ""}`}
        />
      </div>

      <div className="achievement-card-details">
        <h3 className="achievement-card-name">{name}</h3>
        <p className="achievement-card-description">{description}</p>

        {isEarned ? (
          <p className="achievement-card-earned-date">
            Earned on{" "}
            {earnedDate
              ? new Date(earnedDate).toLocaleDateString()
              : "Unknown Date"}
          </p>
        ) : (
          <div className="achievement-card-progress-area">
            <p className="achievement-card-status">Not Earned Yet</p>

            {totalNeeded > 0 && currentProgress !== undefined && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}

            {totalNeeded > 0 && currentProgress !== undefined && (
              <p className="progress-text">
                {currentProgress} / {totalNeeded}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementCard;
