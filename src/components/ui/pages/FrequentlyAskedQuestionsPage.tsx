import { Typography, Divider } from '@mui/material';
import { Box } from '@mui/system';
import FrequentlyAskedQuestion from '../molecules/FrequentlyAskedQuestion';
import React from 'react';
import { NavigationPageLayout } from './NavigationPageLayout';
import {
  navigationAbout,
  navigationFaq,
  navigationFarcasterChannel,
  navigationHome,
  navigationRepository,
} from '../../navigation';
import { type NonEmptyArray, nonEmptyConcat, nonEmptyMap } from '@/types/utils/non-empty';
import type { NavigationContentItem } from '../organisms/Navigation';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

interface FAQEntry {
  anchor: string;
  question: string;
  navTitle: string;
  answerMarkdown: string;
}

const frequentlyAskedQuestions: NonEmptyArray<FAQEntry> = [
  {
    anchor: 'what-is-walletbeat',
    question: 'What is Walletbeat?',
    navTitle: 'What is Walletbeat?',
    answerMarkdown: `
      **Walletbeat is an Ethereum wallet rating site.**

      It aims to provide a trustworthy, up-to-date source of information
      about the state of the Ethereum wallet ecosystem.
    `,
  },
  {
    anchor: 'why-does-walletbeat-exist',
    question: 'Why does Walletbeat exist?',
    navTitle: 'What is Walletbeat for?',
    answerMarkdown: `
      The Ethereum wallet ecosystem today is fragmented and it is difficult
      for users to find a wallet that meets all of their requirements.

      Wallets are not fully interchangeable, so apps need to write
      wallet-specific code to paper over those differences, or encourage
      their users towards wallet types that have better UX but do not
      necessarily reflect Ethereum values nor provide a good way for the
      user to easily change to a fully self-custodial external wallet.

      Wallets themselves are in competition for users and market share,
      causing competitive pressures that emphasize flashy features over
      important-yet-often-neglected values like security, privacy, and
      user self-sovereignty.

      **Walletbeat aims to provide an objective and fair assessment** of
      Ethereum wallets as they stand. Its purpose is similar to that of
      [L2Beat](https://l2beat.com), but for wallets.

      **Where L2Beat assesses Layer 2s, Walletbeat assesses wallets**.
      Much like L2Beat has played a major role in pushing the Layer 2
      ecosystem towards better security and decentralization over time,
      Walletbeat aims to push the Ethereum wallet ecosystem towards similar
      Ethereum-aligned values.
    `,
  },
  {
    anchor: 'why-should-i-care',
    question: 'Why should I care?',
    navTitle: 'Why should I care?',
    answerMarkdown: `
      **As an Ethereum user**, Walletbeat helps you make an informed decision
      about which wallet to use, and which wallet you may want to fund.

      **As an Ethereum wallet developer**, Walletbeat helps you compare your
      own wallet against competitors, and a source of inspiration for roadmap
      items to work on.
    `,
  },
  {
    anchor: 'how-are-wallets-evaluated',
    question: 'How are wallets evaluated?',
    navTitle: 'Wallet evaluation',
    answerMarkdown: `
      Wallets are evaluated on a set of pass-fail rules that evaluate
      specific **attributes**.

      **Attributes** are selected based on the following guidelines:

      * **Ethereum alignment**. This is a notoriously fuzzy concept.
        Walletbeat's interpretation of it centers around
        [cypherpunk values](https://nakamoto.com/the-cypherpunks/), which
        [Vitalik Buterin's own ideas around desirable wallet
        attributes](https://vitalik.eth.limo/general/2024/12/03/wallets.html)
        are also based on. These values include **security**, **privacy**,
        **user self-sovereignty**, and **permissionless interoperability**
        (via shared standards). These principles are mostly timeless and the
        attributes in this category should be mostly static.
      * **Shared Ethereum ecosystem goals**. This is a moving target that
        aims to reflect and accelerate the realization of the goals of the
        rest of the Ethereum ecosystem. For example, Ethereum's rollup-based
        scaling roadmap is well-complemented on the wallet side by focus on
        transparent asset bridging, trustless L2 asset withdrawals, and so on.
      * **Not already market-forces-driven**. Ethereum's wallet ecosystem is
        already driven by market forces to support certain features like
        convenient multi-chain management including the most popular L2s,
        support for popular hardware wallets, and so on.
        Walletbeat aims to complement existing market forces by focusing on
        features where market competition alone may not be enough to
        encourage the ubiquity of a feature across the wallet ecosystem.
        For example, market forces do not always accurately predict the
        likelihood of long-tail events like software supply chain security
        and user data privacy breaches.

      Once desirable attributes are identified, the next step is to rate
      wallets on those attributes based on a set of rules. These rules are
      selected using the following guidelines:

      * **Objectively measurable**. It should be possible to determine
        whether a rule is met or not without involving human judgement.
        For example, a rule that looks at the user data exported to
        third-party servers can be objectively measured by looking at the
        wallet's source code or by analyzing the contents of wallet network
        traffic.
      * **Technology-neutral**. Rules should not prescribe the technology
        used in an implementation of a specific attribute. For example,
        an attribute evaluating whether a wallet's source code license is
        open-source should not prescribe a specific license to use. As
        another example, an attribute evaluating whether a wallet supports
        sending assets privately should not prescribe a specific method to
        send assets privately, and should equally recognize possible
        solutions such as stealth addresses and Privacy Pools.
        Notable exceptions to this guideline include ubiquitous EIPs.
        For example, there may be multiple token standards, but the
        ubiquity of ERC-20 means that other fungible token standards are
        not worth supporting as alternatives to ERC-20 in Walletbeat.
      * **Immediately feasible**. It should be possible for a wallet to
        satisfy an attribute using currently-available technology without
        requiring a future Ethereum protocol upgrade or new browser features
        to exist.
      * **Pragmatic**. It should be possible for a wallet to satisfy an
        attribute without introducing over-burdensome complexity or ruining
        another aspect of the wallet experience in the process.
        For example, one way to satisfy an attribute such as "users should
        be able to submit L1 transactions in a censorship-resistant manner"
        might be for the wallet to require running a full node, but this
        would be impractical for many users to run due to the storage and
        bandwidth requirements involved.
        For such attributes, while rules should recognize and accept
        "users may run a full node and connect their wallet to it" as a valid
        implementation, there should also be other more pragmatic solutions,
        such as "the wallet rotates between with several public transaction
        broadcast endpoints in diverse jurisdictions".
      * **Raising the bar over time**. While pragmatism is important and
        wallets should be able to satisfy an attribute using
        currently-available technology, said technology will improve over time
        and rules should be expected to move along with it.
        For example, while some features may be infeasible to implement in
        browser-based wallets due to current limitations in browsers'
        extension capabilities, these capabilities may change over time and
        rules will be updated accordingly.
    `,
  },
  {
    anchor: 'rating-categories',
    question: 'What do the rating categories mean?',
    navTitle: 'Rating categories',
    answerMarkdown: `
      Wallets are rated based on various attributes which are grouped under
      five high-level buckets:

      * \u{1f512} **Security** attributes measure how secure a wallet is.
        This includes security features such as hardware wallet support,
        chain verification, resilience against software supply chain attacks
        on the wallet's development process, scam warning features, etc.
      * \u{1f575} **Privacy** attributes look at how well a wallet protects
        your privacy. This includes features to interact with the Ethereum
        ecosystem privately such as private transfers, but also how much data
        the wallet collects about you.
      * \u{1f3f0} **Self-sovereignty** attributes determine the control and
        ownership guarantees the wallet gives you over your account, as
        opposed to being dependent on third-party providers to act in a
        trustworthy and reliable manner. This includes the potential for
        your transactions being censored by third-parties, or your ability to
        use DeFi protocols and to withdraw funds from Ethereum layer 2
        solutions without relying on third-parties.
      * \u{1f50d} **Transparency** attributes determine the degree of
        public scrutiny and accountability that a wallet's software
        development process is subject to, and whether that process is
        sustainable. This ensures that the wallet software is trustworthy
        and that it will be maintained for the foreseeable future, which is
        crucial when deciding to rely on a wallet to safeguard your assets
        and data.
      * \u{1f331} **Ecosystem** attributes refer to present-day Ethereum
        ecosystem priorities and transitions that impact the feature set of
        Ethereum wallets. For example, the transition to and fragmentation
        caused by many layer 2 solutions in Ethereum requires wallets to
        adapt by providing easy or seamless ways to move assets across layer
        2 chains, or to support Ethereum addresses that contain chain
        information in them.
        *Note*: Unlike other attribute groups, which are mostly timeless
        principle, the set of \u{1f331} **ecosystem attributes** should be
        expected to change quickly as the Ethereum ecosystem itself evolves.

      For more information on the specific attributes within these
      high-level buckets, refer to these attributes on a wallet-specific
      page.
    `,
  },
  {
    anchor: 'score-computation',
    question: "How are wallets' score computed?",
    navTitle: 'How is the score computed?',
    answerMarkdown: `
      Scores are computed as a weighted average of all the criteria that go
      into assessing wallets.

      Each high-level category has its own weighted-average score, and the
      wallet's final score is a weighted average of those.

      For wallets that have **multiple versions** or run on
      **multiple platforms**, scores are computed for each individual version.
      However, when browsing the Walletbeat homepage without selecting a
      specific version, Walletbeat aggregates the per-version scores by
      taking the **worst** rating on each attribute across versions.
      This is because the worst rating acts as a "floor" for this attribute
      for all versions of the wallet. Therefore, no matter which version of
      this wallet a user chooses, they will be using a wallet that is
      *at least as good* as this aggregated rating. This approach also
      encourages wallet developers to reduce per-version differences and
      reuse as much code and components as possible.
    `,
  },
  {
    anchor: 'who-is-behind-walletbeat',
    question: 'Who is behind Walletbeat?',
    navTitle: 'Who runs Walletbeat?',
    answerMarkdown: `
      Walletbeat was originally created by
      [moritz](https://warpcast.com/moritz/) as an open-source effort to
      document the state of the wallet ecosystem.
      [Multiple contributors](https://github.com/fluidkey/walletbeat/graphs/contributors)
      have helped along the way by adding data on a variety of wallets.

      Walletbeat was later revamped in 2025 by
      [polymutex](https://warpcast.com/polymutex.eth) with a more in-depth
      focus on Ethereum alignment and richer data about individual wallets.
      This is still a work in progress.

      Walletbeat is currently hosted by [Fluidkey](https://fluidkey.com/),
      an incorporated company in Switzerland. In order to maximize credible
      neutrality, Walletbeat's long-term ownership goal is to become an
      independent DAO or foundation (similar to L2Beat) once Walletbeat
      reaches a higher level of maturity and a broader set of regular
      contributors.
    `,
  },
  {
    anchor: 'how-can-i-help',
    question: 'How can I help?',
    navTitle: 'How can I help?',
    answerMarkdown: `
      Walletbeat is a work in progress and we would love your help!

      **The best way to help is to help with wallet research**. There are
      lots of Ethereum wallets put there, and it takes a lot of work to dig
      through their source code and provide accurate assessments.

      **If you are a wallet developer**, your help here would be invaluable
      to ensure that Walletbeat's data about your wallet is accurate and
      up-to-date. Your expertise with your wallet's codebase speeds up this
      process a lot.

      If you would like to help with this, please
      [contribute to our repository!](https://github.com/fluidkey/walletbeat).
    `,
  },
];

function FrequentlyAskedQuestions(): React.JSX.Element {
  return (
    <>
      {frequentlyAskedQuestions.map((entry, index) => (
        <React.Fragment key={entry.anchor}>
          {index === 0 ? null : (
            <Divider
              orientation="horizontal"
              variant="middle"
              flexItem={true}
              sx={{
                marginTop: '1rem',
                marginBottom: '1rem',
                marginLeft: '10%',
                marginRight: '10%',
              }}
            />
          )}
          <FrequentlyAskedQuestion
            anchor={entry.anchor}
            question={entry.question}
            questionTypographyProps={{
              variant: 'h3',
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
            answerTypographyProps={{
              variant: 'body1',
            }}
          >
            {entry.answerMarkdown}
          </FrequentlyAskedQuestion>
        </React.Fragment>
      ))}
    </>
  );
}

export function FrequentlyAskedQuestionsPage(): React.JSX.Element {
  return (
    <NavigationPageLayout
      groups={[
        {
          id: 'nav',
          items: [navigationHome],
          overflow: false,
        },
        {
          id: 'faq-group',
          items: nonEmptyConcat<NavigationContentItem>([
            [
              {
                id: 'faq',
                title: navigationFaq.title,
                icon: navigationFaq.icon,
                contentId: 'faqHeader',
              },
            ],
            nonEmptyMap(frequentlyAskedQuestions, faq => ({
              id: faq.anchor,
              title: faq.navTitle,
              icon: <QuestionMarkIcon />,
              contentId: faq.anchor,
            })),
          ]),
          overflow: true,
        },
        {
          id: 'rest-of-nav',
          items: [navigationAbout, navigationRepository, navigationFarcasterChannel],
          overflow: false,
        },
      ]}
    >
      <Typography id="faqHeader" variant="h1">
        Walletbeat FAQ
      </Typography>
      <Box maxWidth="75vw" display="flex" flexDirection="column" alignItems="stretch">
        <FrequentlyAskedQuestions />
      </Box>
    </NavigationPageLayout>
  );
}
