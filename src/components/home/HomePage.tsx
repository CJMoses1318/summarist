"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AiFillAudio, AiFillBulb, AiFillFileText } from "react-icons/ai";
import { BiCrown } from "react-icons/bi";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { RiLeafLine } from "react-icons/ri";

import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";

import "@/app/home.css";

const statsA = [
  "Enhance your knowledge",
  "Achieve greater success",
  "Improve your health",
  "Develop better parenting skills",
  "Increase happiness",
  "Be the best version of yourself!",
];

const statsB = [
  "Expand your learning",
  "Accomplish your goals",
  "Strengthen your vitality",
  "Become a better caregiver",
  "Improve your mood",
  "Maximize your abilities",
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const openLogin = () => dispatch(uiActions.openAuthModal("login"));

  return (
    <>
      <nav className="nav">
        <div className="nav__wrapper">
          <figure className="nav__img--mask">
            <Image
              className="nav__img"
              src="/logo.png"
              alt="Summarist"
              width={495}
              height={114}
              priority
            />
          </figure>
          <ul className="nav__list--wrapper">
            <li className="nav__list nav__list--login" onClick={openLogin}>
              Login
            </li>
            <li className="nav__list nav__list--mobile">About</li>
            <li className="nav__list nav__list--mobile">Contact</li>
            <li className="nav__list nav__list--mobile">Help</li>
          </ul>
        </div>
      </nav>

      <section id="landing">
        <div className="container">
          <div className="row">
            <div className="landing__wrapper">
              <div className="landing__content">
                <div className="landing__content__title">
                  Gain more knowledge <br className="remove--tablet" /> in less time
                </div>
                <div className="landing__content__subtitle">
                  Great summaries for busy people,
                  <br className="remove--tablet" />
                  individuals who barely have time to read,
                  <br className="remove--tablet" />
                  and even people who don’t like to read.
                </div>
                <button className="btn home__cta--btn" type="button" onClick={openLogin}>
                  Login
                </button>
              </div>
              <figure className="landing__image--mask">
                <Image src="/landing.png" alt="" width={779} height={740} priority />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <div className="row">
            <div className="section__title">Understand books in few minutes</div>
            <div className="features__wrapper">
              <div className="features">
                <div className="features__icon">
                  <AiFillFileText />
                </div>
                <div className="features__title">Read or listen</div>
                <div className="features__sub--title">
                  Save time by getting the core ideas from the best books.
                </div>
              </div>
              <div className="features">
                <div className="features__icon">
                  <AiFillBulb />
                </div>
                <div className="features__title">Find your next read</div>
                <div className="features__sub--title">
                  Explore book lists and personalized recommendations.
                </div>
              </div>
              <div className="features">
                <div className="features__icon">
                  <AiFillAudio />
                </div>
                <div className="features__title">Briefcasts</div>
                <div className="features__sub--title">
                  Gain valuable insights from briefcasts
                </div>
              </div>
            </div>

            <StatisticPair headings={statsA} reverse={false} />
            <StatisticPair headings={statsB} reverse />
          </div>
        </div>
      </section>

      <section id="reviews">
        <div className="row">
          <div className="container">
            <div className="section__title">What our members say</div>
            <div className="reviews__wrapper">
              {[
                {
                  name: "Hanna M.",
                  body: (
                    <>
                      This app has been a <b>game-changer</b> for me! It&apos;s saved me
                      so much time and effort in reading and comprehending books.
                      Highly recommend it to all book lovers.
                    </>
                  ),
                },
                {
                  name: "David B.",
                  body: (
                    <>
                      I love this app! It provides{" "}
                      <b>concise and accurate summaries</b> of books in a way that is easy
                      to understand. It&apos;s also very user-friendly and intuitive.
                    </>
                  ),
                },
                {
                  name: "Nathan S.",
                  body: (
                    <>
                      This app is a great way to get the main takeaways from a book
                      without having to read the entire thing.
                      <b> The summaries are well-written and informative.</b>
                      Definitely worth downloading.
                    </>
                  ),
                },
                {
                  name: "Ryan R.",
                  body: (
                    <>
                      If you&apos;re a busy person who{" "}
                      <b>loves reading but doesn&apos;t have the time</b> to read every book
                      in full, this app is for you! The summaries are thorough and
                      provide a great overview of the book&apos;s content.
                    </>
                  ),
                },
              ].map((r) => (
                <div className="review" key={r.name}>
                  <div className="review__header">
                    <div className="review__name">{r.name}</div>
                    <div className="review__stars">
                      <BsStarFill />
                    </div>
                  </div>
                  <div className="review__body">{r.body}</div>
                </div>
              ))}
            </div>
            <div className="reviews__btn--wrapper">
              <button className="btn home__cta--btn" type="button" onClick={openLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="numbers">
        <div className="container">
          <div className="row">
            <div className="section__title">Start growing with Summarist now</div>
            <div className="numbers__wrapper">
              <div className="numbers">
                <div className="numbers__icon">
                  <BiCrown />
                </div>
                <div className="numbers__title">3 Million</div>
                <div className="numbers__sub--title">Downloads on all platforms</div>
              </div>
              <div className="numbers">
                <div className="numbers__icon numbers__star--icon">
                  <BsStarFill />
                  <BsStarHalf />
                </div>
                <div className="numbers__title">4.5 Stars</div>
                <div className="numbers__sub--title">
                  Average ratings on iOS and Google Play
                </div>
              </div>
              <div className="numbers">
                <div className="numbers__icon">
                  <RiLeafLine />
                </div>
                <div className="numbers__title">97%</div>
                <div className="numbers__sub--title">
                  Of Summarist members create a better reading habit
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer">
        <div className="container">
          <div className="row">
            <div className="footer__top--wrapper">
              <div className="footer__block">
                <div className="footer__link--title">Actions</div>
                <FooterLinks
                  labels={[
                    "Summarist Magazine",
                    "Cancel Subscription",
                    "Help",
                    "Contact us",
                  ]}
                />
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Useful Links</div>
                <FooterLinks
                  labels={[
                    "Pricing",
                    "Summarist Business",
                    "Gift Cards",
                    "Authors & Publishers",
                  ]}
                />
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Company</div>
                <FooterLinks
                  labels={["About", "Careers", "Partners", "Code of Conduct"]}
                />
              </div>
              <div className="footer__block">
                <div className="footer__link--title">Other</div>
                <FooterLinks
                  labels={[
                    "Sitemap",
                    "Legal Notice",
                    "Terms of Service",
                    "Privacy Policies",
                  ]}
                />
              </div>
            </div>
            <div className="footer__copyright--wrapper">
              <div className="footer__copyright">Copyright © 2023 Summarist.</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterLinks({ labels }: { labels: string[] }) {
  return (
    <div>
      {labels.map((l) => (
        <div className="footer__link--wrapper" key={l}>
          <span className="footer__link">{l}</span>
        </div>
      ))}
    </div>
  );
}

function StatisticPair({
  headings,
  reverse,
}: {
  headings: string[];
  reverse: boolean;
}) {
  const [active, setActive] = useState(0);

  const detailsLeft = useMemo(
    () => (
      <>
        <div className="statistics__data">
          <div className="statistics__data--number">93%</div>
          <div className="statistics__data--title">
            of Summarist members <b>significantly increase</b> reading frequency.
          </div>
        </div>
        <div className="statistics__data">
          <div className="statistics__data--number">96%</div>
          <div className="statistics__data--title">
            of Summarist members <b>establish better</b> habits.
          </div>
        </div>
        <div className="statistics__data">
          <div className="statistics__data--number">90%</div>
          <div className="statistics__data--title">
            have made <b>significant positive</b> change to their lives.
          </div>
        </div>
      </>
    ),
    [],
  );

  const detailsRight = useMemo(
    () => (
      <>
        <div className="statistics__data">
          <div className="statistics__data--number">91%</div>
          <div className="statistics__data--title">
            of Summarist members <b>report feeling more productive</b> after
            incorporating the service into their daily routine.
          </div>
        </div>
        <div className="statistics__data">
          <div className="statistics__data--number">94%</div>
          <div className="statistics__data--title">
            of Summarist members have <b>noticed an improvement</b> in their overall
            comprehension and retention of information.
          </div>
        </div>
        <div className="statistics__data">
          <div className="statistics__data--number">88%</div>
          <div className="statistics__data--title">
            of Summarist members <b>feel more informed</b> about current events and
            industry trends since using the platform.
          </div>
        </div>
      </>
    ),
    [],
  );

  const header = (
    <div
      className={`statistics__content--header ${
        reverse ? "statistics__content--header-second" : ""
      }`}
    >
      {headings.map((h, idx) => (
        <div
          key={h}
          className={`statistics__heading ${active === idx ? "statistics__heading--active" : ""}`}
          onMouseEnter={() => setActive(idx)}
          onFocus={() => setActive(idx)}
        >
          {h}
        </div>
      ))}
    </div>
  );

  const leftDetails = (
    <div className="statistics__content--details">{detailsLeft}</div>
  );

  const rightDetails = (
    <div className="statistics__content--details statistics__content--details-second">
      {detailsRight}
    </div>
  );

  if (reverse) {
    return (
      <div className="statistics__wrapper">
        {rightDetails}
        {header}
      </div>
    );
  }

  return (
    <div className="statistics__wrapper">
      {header}
      {leftDetails}
    </div>
  );
}
