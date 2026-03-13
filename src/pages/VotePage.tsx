import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useIsArbitrumSepolia } from "@/hooks/useWalletSessionChainId";
import {
  BarChart3,
  AlertTriangle,
  Home,
  Plus,
  Settings,
  ShieldCheck,
  Vault,
  Vote,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { ActivityFeed } from "@/components/harmony/ActivityFeed";
import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { GovernWorkspaceChrome, GOVERN_TABS, type GovernWorkspaceTab } from "@/components/harmony/GovernWorkspaceChrome";
import { HarmonyFormCard } from "@/components/harmony/harmony-ui";
import { VoteHarmonyDashboard } from "@/components/harmony/VoteHarmonyDashboard";
import {
  VoteHarmonyNotConnected,
  VoteHarmonyPanelCard,
  VoteHarmonySubNav,
  VoteHarmonyTabShell,
} from "@/components/harmony/VoteHarmonyTabShell";

import ProposalList from "@/components/vote/ProposalList";
import CastVoteForm from "@/components/vote/CastVoteForm";
import TallyReveal from "@/components/vote/TallyReveal";
import CreateProposalForm from "@/components/vote/CreateProposalForm";
import VotingHistory from "@/components/vote/VotingHistory";
import AdminControls from "@/components/vote/AdminControls";
import { DelegationPanel } from "@/components/vote/DelegationPanel";
import { TreasuryPanel } from "@/components/vote/TreasuryPanel";
import { RewardsPanel } from "@/components/vote/RewardsPanel";
import { GovernorPanel } from "@/components/vote/GovernorPanel";
import { VoteParticipationProfile } from "@/components/vote/VoteParticipationProfile";
import { VoteCollapsibleSection } from "@/components/vote/VoteCollapsibleSection";
import { VoteAdvancedIntro } from "@/components/vote/VoteAdvancedIntro";
import { VoteNotificationsPanel } from "@/components/vote/VoteNotificationsPanel";
import { useVoteOwner, useVoteRole } from "@/hooks/useProposals";
import { Role } from "@/lib/constants";

type VoteSection = "overview" | "proposals" | "participation" | "advanced";
type ProposalMode = "browse" | "create" | "vote" | "results";
type AdvancedMode = "treasury" | "governor";

const PROPOSAL_MODES: ProposalMode[] = ["browse", "create", "vote", "results"];

function isProposalMode(value: string | null): value is ProposalMode {
  return value != null && PROPOSAL_MODES.includes(value as ProposalMode);
}

function sectionToGovernTab(section: VoteSection, advancedMode: AdvancedMode): GovernWorkspaceTab {
  if (section === "overview") return "overview";
  if (section === "proposals") return "proposals";
  if (section === "participation") return "rewards";
  if (advancedMode === "treasury") return "treasury";
  return "advanced";
}

const VotePage = () => {
  const { address, isConnected } = useAccount();
  const { data: ownerAddress } = useVoteOwner();
  const { data: userRoleRaw } = useVoteRole(address);
  const isOwner = !!address && !!ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();
  const userRole = (userRoleRaw as number) ?? Role.NONE;
  const isAdmin = userRole === Role.ADMIN || isOwner;

  const { isWrongNetwork: wrongNetwork, sessionChainId } = useIsArbitrumSepolia();
  const wrongNetworkConnected = isConnected && wrongNetwork;

  const [searchParams, setSearchParams] = useSearchParams();

  const [section, setSection] = useState<VoteSection>("overview");
  const [proposalMode, setProposalMode] = useState<ProposalMode>("browse");
  const [advancedMode, setAdvancedMode] = useState<AdvancedMode>("treasury");
  const [jumpProposalId, setJumpProposalId] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [delegationSectionOpen, setDelegationSectionOpen] = useState(false);
  const [rewardsSectionOpen, setRewardsSectionOpen] = useState(true);
  const [historySectionOpen, setHistorySectionOpen] = useState(false);

  const writeVoteUrl = useCallback(
    (opts: { tab?: GovernWorkspaceTab; mode?: ProposalMode; panel?: "rewards" | "history" | "delegation" }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.delete("mode");
          params.delete("panel");

          const tab = opts.tab ?? "overview";
          if (tab === "overview") {
            params.delete("tab");
          } else {
            params.set("tab", tab);
          }

          if (tab === "proposals" && opts.mode && opts.mode !== "browse") {
            params.set("mode", opts.mode);
          }

          if (tab === "rewards") {
            params.set("tab", "rewards");
          } else if (tab === "participation" && opts.panel) {
            params.set("tab", "participation");
            params.set("panel", opts.panel);
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    const urlMode = searchParams.get("mode");
    const urlPanel = searchParams.get("panel");

    if (!urlTab || urlTab === "overview") {
      setSection("overview");
      return;
    }

    if (urlTab === "proposals") {
      setSection("proposals");
      setProposalMode(isProposalMode(urlMode) ? urlMode : "browse");
      return;
    }

    if (urlTab === "rewards") {
      setSection("participation");
      setRewardsSectionOpen(true);
      setHistorySectionOpen(false);
      setDelegationSectionOpen(false);
      return;
    }

    if (urlTab === "participation") {
      setSection("participation");
      setRewardsSectionOpen(urlPanel === "rewards");
      setHistorySectionOpen(urlPanel === "history");
      setDelegationSectionOpen(urlPanel === "delegation");
      return;
    }

    if (urlTab === "treasury") {
      setSection("advanced");
      setAdvancedMode("treasury");
      return;
    }

    if (urlTab === "advanced") {
      setSection("advanced");
      setAdvancedMode("governor");
    }
  }, [searchParams]);

  const openParticipationDelegation = useCallback(() => {
    setSection("participation");
    setDelegationSectionOpen(true);
    setRewardsSectionOpen(false);
    setHistorySectionOpen(false);
    writeVoteUrl({ tab: "participation", panel: "delegation" });
  }, [writeVoteUrl]);

  const openParticipationRewards = useCallback(() => {
    setSection("participation");
    setRewardsSectionOpen(true);
    setHistorySectionOpen(false);
    setDelegationSectionOpen(false);
    writeVoteUrl({ tab: "rewards" });
  }, [writeVoteUrl]);

  const openProposals = useCallback(
    (mode: ProposalMode = "browse", proposalId?: number | string) => {
      setSection("proposals");
      setProposalMode(mode);
      if (proposalId !== undefined) setJumpProposalId(String(proposalId));
      writeVoteUrl({ tab: "proposals", mode });
    },
    [writeVoteUrl],
  );

  const selectGovernTab = useCallback(
    (tab: GovernWorkspaceTab) => {
      switch (tab) {
        case "overview":
          setSection("overview");
          writeVoteUrl({ tab: "overview" });
          break;
        case "proposals":
          openProposals("browse");
          break;
        case "treasury":
          setSection("advanced");
          setAdvancedMode("treasury");
          writeVoteUrl({ tab: "treasury" });
          break;
        case "rewards":
          setSection("participation");
          setRewardsSectionOpen(true);
          setHistorySectionOpen(false);
          setDelegationSectionOpen(false);
          writeVoteUrl({ tab: "rewards" });
          break;
        case "advanced":
          setSection("advanced");
          setAdvancedMode("governor");
          writeVoteUrl({ tab: "advanced" });
          break;
      }
    },
    [openProposals, writeVoteUrl],
  );

  const governTab = sectionToGovernTab(section, advancedMode);

  const proposalActions = (
    <>
      <button
        type="button"
        onClick={() => openProposals("vote")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 px-3 text-xs",
          proposalMode === "browse" || proposalMode === "vote" ? "dash-btn-primary" : "dash-btn-outline",
        )}
      >
        <Vote className="h-3.5 w-3.5" />
        Vote privately
      </button>
      <button
        type="button"
        onClick={() => openProposals("create")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 px-3 text-xs",
          proposalMode === "create" ? "dash-btn-primary" : "dash-btn-outline",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Create
      </button>
      <button
        type="button"
        onClick={() => openProposals("results")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 px-3 text-xs",
          proposalMode === "results" ? "dash-btn-primary" : "dash-btn-outline",
        )}
      >
        <BarChart3 className="h-3.5 w-3.5" />
        Results
      </button>
    </>
  );

  const renderProposalContent = () => {
    switch (proposalMode) {
      case "vote":
        if (!isConnected) {
          return <VoteHarmonyNotConnected message="Connect your wallet to cast an encrypted vote." />;
        }
        return (
          <>
            <VoteHarmonyPanelCard title="Vote on proposal" eyebrow="Private ballot">
              <div className="harmony-form-inner">
                <CastVoteForm
                  initialProposalId={jumpProposalId}
                  embedded
                  onOpenDelegation={openParticipationDelegation}
                />
              </div>
            </VoteHarmonyPanelCard>
            <VoteHarmonyPanelCard title="Your ballot history" eyebrow="Private verification">
              <div className="harmony-form-inner">
                <VotingHistory embedded />
              </div>
            </VoteHarmonyPanelCard>
          </>
        );
      case "results":
        return (
          <VoteHarmonyPanelCard title="Reveal aggregate totals" eyebrow="Results">
            <div className="harmony-form-inner">
              <TallyReveal onClaimRewards={openParticipationRewards} />
            </div>
          </VoteHarmonyPanelCard>
        );
      case "create":
        if (!isConnected) {
          return <VoteHarmonyNotConnected message="Connect your wallet to create proposals." />;
        }
        return (
          <>
            <VoteHarmonyPanelCard title="Create a private proposal" eyebrow="Secondary action">
              <div className="harmony-form-inner">
                <CreateProposalForm onSuccess={() => openProposals("browse")} embedded />
              </div>
            </VoteHarmonyPanelCard>
            {isAdmin && (
              <VoteHarmonyPanelCard title="Administrative controls" eyebrow="Admin">
                <div className="harmony-form-inner">
                  <AdminControls />
                </div>
              </VoteHarmonyPanelCard>
            )}
          </>
        );
      case "browse":
      default:
        return (
          <>
            <VoteHarmonyPanelCard title="Private proposals" eyebrow="Needs action">
              <div className="harmony-form-inner">
                <ProposalList onVote={(id) => openProposals("vote", id)} embedded />
              </div>
            </VoteHarmonyPanelCard>
            {isConnected && (
              <VoteHarmonyPanelCard title="Your ballot history" eyebrow="Private verification">
                <div className="harmony-form-inner">
                  <VotingHistory embedded />
                </div>
              </VoteHarmonyPanelCard>
            )}
          </>
        );
    }
  };

  const renderActiveSection = () => {
    switch (section) {
      case "overview":
        return (
          <div className="space-y-6">
            <VoteHarmonyDashboard
              onVote={() => openProposals("vote")}
              onParticipation={() => setSection("participation")}
              onOpenProposals={() => openProposals("browse")}
              onCreate={() => openProposals("create")}
            />

            <HarmonyFormCard title="Proposals needing attention" eyebrow="Active governance">
              <div className="harmony-form-inner vote-harmony-panel -mx-2">
                <ProposalList onVote={(id) => openProposals("vote", id)} initialFilter="active" embedded />
              </div>
            </HarmonyFormCard>
          </div>
        );

      case "proposals":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="proposals" sub={proposalMode} actions={proposalActions} hideIntro>
              <VoteHarmonySubNav
                active={proposalMode}
                onChange={(mode) => openProposals(mode)}
                items={[
                  { key: "browse", label: "Browse", icon: Home },
                  { key: "vote", label: "Vote", icon: Vote },
                  { key: "create", label: "Create", icon: Plus },
                  { key: "results", label: "Results", icon: BarChart3 },
                ]}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={proposalMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6"
                >
                  {renderProposalContent()}
                </motion.div>
              </AnimatePresence>
            </VoteHarmonyTabShell>
          </div>
        );

      case "participation":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="participation" hideIntro>
              <VoteParticipationProfile />

              <VoteCollapsibleSection
                title="Rewards"
                eyebrow="Voter incentives"
                badge="Claim ETH"
                defaultOpen
                open={rewardsSectionOpen}
                onOpenChange={setRewardsSectionOpen}
              >
                <div className="harmony-form-inner -mx-1">
                  <RewardsPanel />
                </div>
              </VoteCollapsibleSection>

              <VoteCollapsibleSection
                title="Ballot history"
                eyebrow="Private verification"
                defaultOpen={false}
                open={historySectionOpen}
                onOpenChange={setHistorySectionOpen}
              >
                <div className="harmony-form-inner -mx-1">
                  {!isConnected ? (
                    <VoteHarmonyNotConnected message="Connect your wallet to review ballot history and verify votes on this device." />
                  ) : (
                    <VotingHistory embedded />
                  )}
                </div>
              </VoteCollapsibleSection>

              <VoteCollapsibleSection
                title="Delegation"
                eyebrow="Public power routing"
                defaultOpen={false}
                open={delegationSectionOpen}
                onOpenChange={setDelegationSectionOpen}
              >
                <div className="harmony-form-inner -mx-1">
                  {!isConnected ? (
                    <VoteHarmonyNotConnected message="Connect your wallet to manage delegation." />
                  ) : (
                    <DelegationPanel />
                  )}
                </div>
              </VoteCollapsibleSection>

              <VoteCollapsibleSection title="Vote alerts" eyebrow="Notifications" defaultOpen={false}>
                <VoteNotificationsPanel embedded />
              </VoteCollapsibleSection>

              <ActivityFeed
                defaultFilter="vote"
                filters={["vote"]}
                title="Recent governance activity"
                eyebrow="Shared activity"
                emptyMessage="No indexed Vote activity found for this wallet yet."
              />
            </VoteHarmonyTabShell>
          </div>
        );

      case "advanced":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="advanced" hideIntro>
              <VoteAdvancedIntro />
              <VoteHarmonySubNav
                active={advancedMode}
                onChange={setAdvancedMode}
                items={[
                  { key: "treasury", label: "Treasury", icon: Vault },
                  { key: "governor", label: "Governor", icon: ShieldCheck },
                ]}
              />
              <div className="mt-6">
                {advancedMode === "treasury" ? (
                  <VoteHarmonyPanelCard title="Treasury lifecycle" eyebrow="Timelock spends">
                    <div className="harmony-form-inner">
                      <TreasuryPanel />
                    </div>
                  </VoteHarmonyPanelCard>
                ) : (
                  <VoteHarmonyPanelCard title="Executable governance" eyebrow="Governor · Timelock">
                    <div className="harmony-form-inner -mx-2">
                      <GovernorPanel wrongNetwork={wrongNetworkConnected} />
                    </div>
                  </VoteHarmonyPanelCard>
                )}
              </div>
            </VoteHarmonyTabShell>
          </div>
        );
    }
  };

  const harmonySidebar = GOVERN_TABS.map((item) => ({
    key: item.key,
    label: item.label,
    mobileLabel: item.label,
    icon: item.icon,
    active: governTab === item.key,
    onClick: () => selectGovernTab(item.key),
  }));

  return (
    <HarmonyAppShell
      sidebar={harmonySidebar}
      searchPlaceholder="Search proposals…"
    >
      <GovernWorkspaceChrome tab={governTab} onSelectTab={selectGovernTab} />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="dash-btn-outline h-9 px-3 text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Vote alerts
        </button>
      </div>
      {wrongNetworkConnected && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Wrong network</div>
            <div className="mt-0.5 text-xs text-amber-800/80">
              Your wallet is on chain <span className="font-semibold">{sessionChainId ?? "unknown"}</span>.
              Switch to <span className="font-semibold">Arbitrum Sepolia</span> (421614) in MetaMask or use the header switch button before voting or creating proposals.
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              className="mobile-app-panel-full fixed right-0 z-[60] w-full overflow-y-auto border-l hairline bg-card shadow-2xl sm:w-[430px]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Settings className="h-4 w-4" /> Vote settings
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close Vote settings"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-5 px-5 py-5">
                <VoteNotificationsPanel />
                <div className="rounded-xl border border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
                  Vote alerts are generic. They can tell you a proposal needs action or a tally is ready, but never which option you selected.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </HarmonyAppShell>
  );
};

export default VotePage;
