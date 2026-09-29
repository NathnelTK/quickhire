import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Stat {
  value: string;
  label: string;
}

interface Feature {
  title: string;
  description: string;
  icon: 'search' | 'send' | 'chart';
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  protected readonly stats: Stat[] = [
    { value: '10K+', label: 'Jobs' },
    { value: '5K+', label: 'Companies' },
    { value: '20K+', label: 'Candidates' }
  ];

  protected readonly features: Feature[] = [
    {
      title: 'Discover Opportunities',
      description: 'Browse curated roles matched to your skills.',
      icon: 'search'
    },
    {
      title: 'Apply With Ease',
      description: 'Send your profile in a few simple steps.',
      icon: 'send'
    },
    {
      title: 'Track Your Journey',
      description: 'Stay updated from application to offer.',
      icon: 'chart'
    }
  ];
}
