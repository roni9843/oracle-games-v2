const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');

// ─────────────────────────────────────────
// GET /api/cricket/matches
// Scrapes the match carousel from cricbuzz.com
// ─────────────────────────────────────────
router.get('/matches', async (req, res) => {
  try {
    const { data: html } = await axios.get('https://www.cricbuzz.com/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);
    const matches = [];

    // Each carousel card
    $('.carousal-item').each((_, el) => {
      const $el  = $(el);
      const $a   = $el.find('a').first();
      const href = $a.attr('href') || '';

      // Extract match id from href  e.g. /live-cricket-scores/139381/...
      const idMatch = href.match(/\/(\d+)\//);
      const matchId = idMatch ? idMatch[1] : null;

      const subtitle   = $a.find('span').first().text().trim();
      const matchType  = $a.find('[class*="cbItmBkgDark"]').text().trim();
      const fullUrl    = href ? `https://www.cricbuzz.com${href}` : null;
      const title      = $a.attr('title') || '';

      // Teams
      const teamRows = $a.find('.flex-col.gap-3 > div');
      const parseTeam = ($row) => {
        const img   = $row.find('img').first();
        const flag  = img.attr('src') || img.attr('srcset')?.split(' ')[0] || null;
        const name  = img.attr('alt') || $row.find('span').first().text().trim();
        const score = $row.find('span.font-medium, span[class*="font-semibold"]').last().text().trim();
        return { name, flag, score };
      };

      const team1 = teamRows.length >= 1 ? parseTeam($(teamRows[0])) : null;
      const team2 = teamRows.length >= 2 ? parseTeam($(teamRows[1])) : null;

      // Status (last span after teams)
      const $status = $a.find('span[class*="text-cb"]').last();
      const status  = $status.text().trim();

      // Determine state from class
      let state = 'preview'; // preview | live | complete
      const statusClass = $status.attr('class') || '';
      if (statusClass.includes('cbLive'))     state = 'live';
      else if (statusClass.includes('cbComplete')) state = 'complete';

      // Bottom links
      const links = [];
      $el.find('a').slice(1).each((_, linkEl) => {
        const $link = $(linkEl);
        links.push({
          label: $link.attr('title') || $link.text().trim(),
          href: `https://www.cricbuzz.com${$link.attr('href') || ''}`,
        });
      });

      if (team1 || team2) {
        matches.push({ matchId, title, subtitle, matchType, fullUrl, team1, team2, status, state, links });
      }
    });

    res.json({ success: true, count: matches.length, data: matches });
  } catch (err) {
    console.error('[Cricket Scraper Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/cricket/live-crex
// Scrapes live matches from crex.com
// ─────────────────────────────────────────
router.get('/live-crex', async (req, res) => {
  try {
    const { data: html } = await axios.get('https://crex.com/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);
    const matches = [];

    $('.live-card').each((_, el) => {
      const $card = $(el);
      
      // Series Name
      const seriesName = $card.find('.snameTag').text().trim();
      
      // Match Details Link
      const $matchLink = $card.find('a[href*="/cricket-live-score/"]').first();
      const relativeUrl = $matchLink.attr('href') || '';
      const fullUrl = relativeUrl ? `https://crex.com${relativeUrl}` : null;
      
      // Match ID from URL
      const matchIdMatch = relativeUrl.match(/-(\d+|[A-Z0-9]+)$/);
      const matchId = matchIdMatch ? matchIdMatch[1] : null;

      // Match Number / Venue
      const matchDetails = $card.find('.match-number').text().trim();
      const matchParts = matchDetails.split(',');
      const matchType = matchParts[0]?.trim() || '';
      const venue = matchParts[1]?.trim() || '';

      // Teams and Scores
      const teamNodes = $card.find('.team-score');
      const teams = [];
      
      teamNodes.each((i, teamEl) => {
        const $team = $(teamEl);
        const name = $team.find('.team-name').text().trim();
        const flag = $team.find('img').attr('src');
        
        // Extract score - usually after team name
        // We look for text nodes or spans that aren't team-name
        let score = '';
        $team.contents().each((_, node) => {
            if (node.type === 'text' || ($(node).is('span') && !$(node).hasClass('team-name'))) {
                score += $(node).text().trim() + ' ';
            }
        });
        score = score.replace(/\s+/g, ' ').trim();

        teams.push({ name, flag, score });
      });

      const team1 = teams[0] || null;
      const team2 = teams[1] || null;

      // Status / Result
      let status = '';
      const $result = $card.find('span[style*="--ce_highlight_ac3"]');
      if ($result.length) {
        status = $result.text().trim();
      } else {
        const $upcoming = $card.find('.live-data .upcoming');
        if ($upcoming.length) {
          status = $upcoming.find('.match-data').text().trim() + ' ' + $upcoming.find('.match-time').text().trim();
        } else {
           status = $card.find('.comment').first().text().trim() || 'Live';
        }
      }

      // State
      let state = 'preview';
      if ($card.find('.liveTag').length) {
        state = 'live';
      } else if (status.toLowerCase().includes('won') || status.toLowerCase().includes('abandoned')) {
        state = 'complete';
      }

      if (team1 || team2) {
        matches.push({
          matchId,
          title: `${team1?.name || 'TBD'} vs ${team2?.name || 'TBD'}`,
          subtitle: seriesName,
          matchType,
          venue,
          fullUrl,
          team1,
          team2,
          status,
          state,
          links: []
        });
      }
    });

    res.json({ success: true, count: matches.length, data: matches });
  } catch (err) {
    console.error('[Crex Scraper Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
